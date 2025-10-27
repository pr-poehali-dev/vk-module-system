import json
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.parse
import urllib.error
import re

def parse_vk_attachment(url: str) -> Optional[str]:
    '''
    Извлекает attachment ID из VK ссылки
    Форматы: https://vk.com/photo-8979575_457255897, https://vk.com/video-197015974_456239076
    '''
    if not url or 'vk.com' not in url:
        return None
    
    # photo-OWNER_ID_MEDIA_ID или video-OWNER_ID_MEDIA_ID
    photo_match = re.search(r'photo(-?\d+)_(\d+)', url)
    if photo_match:
        return f"photo{photo_match.group(1)}_{photo_match.group(2)}"
    
    video_match = re.search(r'video(-?\d+)_(\d+)', url)
    if video_match:
        return f"video{video_match.group(1)}_{video_match.group(2)}"
    
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
                
                # Парсим VK attachment из ссылки
                attachment = None
                if image_url:
                    attachment = parse_vk_attachment(image_url)
                
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