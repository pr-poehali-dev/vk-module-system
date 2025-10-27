import json
from typing import Dict, Any, List
import urllib.request
import urllib.parse
import urllib.error

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Публикация постов в группы ВКонтакте
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
        body_data = json.loads(event.get('body', '{}'))
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
                
                params = {
                    'owner_id': f'-{group_id}',
                    'message': post_text,
                    'access_token': token,
                    'v': '5.131'
                }
                
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
