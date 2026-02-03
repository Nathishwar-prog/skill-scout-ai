import jwt
import time

secret = "super-secret-jwt-token-with-at-least-32-characters-long"
payload = {
    "role": "anon",
    "iss": "http://127.0.0.1:54321/auth/v1",
    "iat": int(time.time()),
    "exp": int(time.time()) + 3153600000  # 100 years
}

token = jwt.encode(payload, secret, algorithm="HS256")
print(token)
