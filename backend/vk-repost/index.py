import json
from typing import Dict, Any, List
import urllib.request
import urllib.parse
import urllib.error

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Репост постов из источников в целевые группы ВКонтакте
    Args: event - dict с httpMethod, body (token, sourceGroups, sourceUsers, postCount, targetGroups)
          context - объект с request_id
    Returns: HTTP response dict с результатами репостов
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
        source_groups: List[str] = body_data.get('sourceGroups', [])
        source_users: List[str] = body_data.get('sourceUsers', [])
        post_count: int = body_data.get('postCount', 10)
        target_groups: List[Dict] = body_data.get('targetGroups', [])
        
        if not token or not target_groups or (not source_groups and not source_users):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        results = []
        
        sources = []
        for group_id in source_groups:
            sources.append({'owner_id': f'-{group_id}', 'name': f'Группа {group_id}'})
        for user_id in source_users:
            sources.append({'owner_id': user_id, 'name': f'Пользователь {user_id}'})
        
        for source in sources:
            owner_id = source['owner_id']
            source_name = source['name']
            
            params = {
                'owner_id': owner_id,
                'count': min(post_count, 100),
                'access_token': token,
                'v': '5.131'
            }
            
            wall_url = 'https://api.vk.com/method/wall.get?' + urllib.parse.urlencode(params)
            
            try:
                with urllib.request.urlopen(wall_url) as response:
                    wall_result = json.loads(response.read().decode())
                    
                    if 'error' in wall_result:
                        for target in target_groups:
                            results.append({
                                'sourceOwner': source_name,
                                'targetGroup': target.get('name', ''),
                                'success': False,
                                'error': wall_result['error'].get('error_msg', 'Ошибка получения постов')
                            })
                        continue
                    
                    posts = wall_result.get('response', {}).get('items', [])
                    
                    if not posts:
                        for target in target_groups:
                            results.append({
                                'sourceOwner': source_name,
                                'targetGroup': target.get('name', ''),
                                'success': False,
                                'error': 'Нет постов для репоста'
                            })
                        continue
                    
                    for target in target_groups:
                        target_group_id = target.get('groupId', '')
                        
                        for post in posts[:post_count]:
                            post_id = post.get('id')
                            
                            repost_params = {
                                'object': f'wall{owner_id}_{post_id}',
                                'group_id': target_group_id,
                                'access_token': token,
                                'v': '5.131'
                            }
                            
                            repost_url = 'https://api.vk.com/method/wall.repost?' + urllib.parse.urlencode(repost_params)
                            
                            try:
                                with urllib.request.urlopen(repost_url) as repost_response:
                                    repost_result = json.loads(repost_response.read().decode())
                                    
                                    if 'error' in repost_result:
                                        results.append({
                                            'sourceOwner': source_name,
                                            'targetGroup': target.get('name', target_group_id),
                                            'success': False,
                                            'error': repost_result['error'].get('error_msg', 'Ошибка репоста')
                                        })
                                    else:
                                        results.append({
                                            'sourceOwner': source_name,
                                            'targetGroup': target.get('name', target_group_id),
                                            'success': True,
                                            'postId': repost_result.get('response', {}).get('post_id')
                                        })
                            
                            except urllib.error.URLError as e:
                                results.append({
                                    'sourceOwner': source_name,
                                    'targetGroup': target.get('name', target_group_id),
                                    'success': False,
                                    'error': str(e)
                                })
            
            except urllib.error.URLError as e:
                for target in target_groups:
                    results.append({
                        'sourceOwner': source_name,
                        'targetGroup': target.get('name', ''),
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
