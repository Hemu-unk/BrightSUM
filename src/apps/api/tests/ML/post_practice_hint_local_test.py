from fastapi.testclient import TestClient
from brightsum_api.main import app

client = TestClient(app)

payload = {
    'correct_rate_topic': 0.3,
    'avg_time_topic': 40.0,
    'base_difficulty': 'hard',
    'mastery': 0.2,
    'hints_used_topic': 1.5,
    'hints_used_question': 2,
}

resp = client.post('/api/practice/1/hint', json=payload)
print('status', resp.status_code)
print(resp.json())
