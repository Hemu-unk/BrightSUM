import json
import urllib.request

payload = {
    'correct_rate_topic': 0.3,
    'avg_time_topic': 40.0,
    'base_difficulty': 'hard',
    'mastery': 0.2,
    'hints_used_topic': 1.5,
    'hints_used_question': 2,
}

data = json.dumps(payload).encode()
req = urllib.request.Request('http://127.0.0.1:8001/api/practice/1/hint', data=data, headers={'Content-Type': 'application/json'})
print('Posting to /api/practice/1/hint...')
with urllib.request.urlopen(req, timeout=10) as resp:
    print(resp.read().decode())
