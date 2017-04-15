## Login
curl -X "POST" "http://localhost:1337/v1/auth/login" \
     -H "Content-Type: application/json; charset=utf-8" \
     -d "{\"userName\":\"$1\",\"password\":\"$2\"}"
