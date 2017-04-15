## Validate token
curl -X "GET" "http://localhost:1337/v1/auth/validate/$1" \
     -H "Content-Type: application/json; charset=utf-8"
