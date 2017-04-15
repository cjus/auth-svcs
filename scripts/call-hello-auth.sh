## Call hello-auth-service secure endpoint
curl -X "GET" "http://localhost:9000/v1/hello-auth/secure" \
	-H "Authorization: Bearer $1" \
	-H "Content-Type: application/json; charset=utf-8"

