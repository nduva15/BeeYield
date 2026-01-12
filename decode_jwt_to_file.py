import base64

s_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHhzZ25vZWlja29taHNnZWNvIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzg1MjAwMSwiZXhwIjoyMDgzNDI4MDAxfQ.rBmS_M_yhr6CDK4_B8LQ5DG3_z1xEc5UHU4qwtC0-Hc"
parts = s_key.split('.')

def decode(data):
    rem = len(data) % 4
    if rem > 0: data += '=' * (4 - rem)
    return base64.urlsafe_b64decode(data).decode('utf-8')

with open('decoded_jwt.txt', 'w') as f:
    f.write("P:" + decode(parts[1]) + "\n")
