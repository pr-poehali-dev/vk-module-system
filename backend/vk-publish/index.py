import json
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.parse
import urllib.error
import base64

def upload_image(token: str, group_id: str, image_url: str) -> Optional[str]:
    '''
    Загружает изображение в VK и возвращает attachment строку
    '''
    try:
        # 1. Получаем upload URL
        params = {
            'group_id': group_id,
            'access_token': token,
            'v': '5.131'
        }
        url = 'https://api.vk.com/method/photos.getWallUploadServer?' + urllib.parse.urlencode(params)
        
        with urllib.request.urlopen(url) as response:
            result = json.loads(response.read().decode())
            
            if 'error' in result:
                return None
            
            upload_url = result.get('response', {}).get('upload_url')
            if not upload_url:
                return None
        
        # 2. Скачиваем изображение
        with urllib.request.urlopen(image_url) as img_response:
            image_data = img_response.read()
        
        # 3. Загружаем на сервер VK
        boundary = '----WebKitFormBoundary' + base64.b64encode(bytes(str(id(image_data)), 'utf-8')).decode()[:16]
        body_parts = []
        body_parts.append(f'--{boundary}'.encode())
        body_parts.append(b'Content-Disposition: form-data; name="photo"; filename="image.jpg"')
        body_parts.append(b'Content-Type: image/jpeg')
        body_parts.append(b'')
        body_parts.append(image_data)
        body_parts.append(f'--{boundary}--'.encode())
        body = b'\r\n'.join(body_parts)
        
        req = urllib.request.Request(
            upload_url,
            data=body,
            headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
        )
        
        with urllib.request.urlopen(req) as response:
            upload_result = json.loads(response.read().decode())
            
            if 'photo' not in upload_result:
                return None
        
        # 4. Сохраняем фото
        save_params = {
            'group_id': group_id,
            'photo': upload_result['photo'],
            'server': upload_result['server'],
            'hash': upload_result['hash'],
            'access_token': token,
            'v': '5.131'
        }
        
        save_url = 'https://api.vk.com/method/photos.saveWallPhoto?' + urllib.parse.urlencode(save_params)
        
        with urllib.request.urlopen(save_url) as response:
            save_result = json.loads(response.read().decode())
            
            if 'error' in save_result or 'response' not in save_result:
                return None
            
            photo_data = save_result['response'][0]
            return f"photo{photo_data['owner_id']}_{photo_data['id']}"
    
    except Exception:
        return None


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Публикация постов в группы ВКонтакте с изображениями
    Args: event - dict с httpMethod, body (token, groups, posts, settings)
          context - объект с request_id
    Returns: HTTP response dict с результатами публикации
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_str = event.get('body', '{}')
        if not body_str or body_str == '':
            body_str = '{}'
        
        body_data = json.loads(body_str)
        token: str = body_data.get('token', '')
        groups: List[Dict] = body_data.get('groups', [])
        posts: List[Dict] = body_data.get('posts', [])
        
        if not token or not groups or not posts:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing required fields: token, groups, posts'})
            }
        
        results = []
        
        for group in groups:
            group_id = group.get('groupId', '')
            
            for post in posts:
                post_text = post.get('text', '')
                image_url = post.get('image', '')
                
                # Загружаем изображение если есть
                attachment = None
                if image_url:
                    attachment = upload_image(token, group_id, image_url)
                
                params = {
                    'owner_id': f'-{group_id}',
                    'message': post_text,
                    'access_token': token,
                    'v': '5.131'
                }
                
                if attachment:
                    params['attachments'] = attachment
                
                url = 'https://api.vk.com/method/wall.post?' + urllib.parse.urlencode(params)
                
                try:
                    with urllib.request.urlopen(url) as response:
                        result = json.loads(response.read().decode())
                        
                        if 'error' in result:
                            results.append({
                                'group': group.get('name', group_id),
                                'post': post_text[:50] + '...',
                                'success': False,
                                'error': result['error'].get('error_msg', 'Unknown error')
                            })
                        else:
                            results.append({
                                'group': group.get('name', group_id),
                                'post': post_text[:50] + '...',
                                'success': True,
                                'post_id': result.get('response', {}).get('post_id')
                            })
                
                except urllib.error.URLError as e:
                    results.append({
                        'group': group.get('name', group_id),
                        'post': post_text[:50] + '...',
                        'success': False,
                        'error': str(e)
                    })
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'results': results,
                'total': len(results),
                'successful': len([r for r in results if r['success']])
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }