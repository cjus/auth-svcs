[Back](README.md)

## POST v1/auth/login
Login a registered user. Can login based on `userID`, `phoneNumber` or `email`.
This API returns a JSON object containing the newly sign'ed in users token.

## Also See
* [POST /v1/auth/logout](./api-logout-v1.md)
* [GET /v1/auth/validate](./api-validate-v1.md)

### JSON Request

```javascript
{  
  "userID": "f419c582-c115-4456-81b2-988a79768ddb",
  "password": "omega"
}
```

OR

```javascript
{
  "phoneNumber": "8054900836",
  "password": "omega"
}
```

OR

```javascript
{
  "email": "cjus34@gmail.com",
  "password": "omega"
}
```

Attribute |	Description
--- | ---
userID | User ID
password | Unencrypted password

### JSON Response

```javascript
{
  "statusCode": 200,
  "statusMessage": "OK",
  "statusDescription": "Request succeeded without error",
  "result": {
    "isValid": true,
    "userID": "f419c582-c115-4456-81b2-988a79768ddb",
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TmFtZSI6Ikp1c3Rpbmlhbm8iLCJmaXJzdE5hbWUiOiJDYXJsb3MiLCJyb2xlcyI6WyJ1c2VyIiwiYWRtaW4iXSwidWlkIjoiOGNhMGMzZGEtMjk0Ni00NTRkLWE0NjMtNDYwNjVjNDdjYzQzIiwidXNlck5hbWUiOiJjYXJsb3NqIiwiaXNzdWVyIjoidXJuOmF1dGgiLCJleHAiOjE0ODI3Njk4MjUsImlhdCI6MTQ4Mjc2NjIyNX0.Lr2TFDTRivFJC6LyRM8JDTq09SgLdmG6bI47Gg4GKxr-60RE9-HYAFKV89pjGlMr8O4CUTgkiI8PmT08Q108dbq52ybqtPVpfnaG6wt0HD72yGfE_EuLtLqtgg-lsa2C-MN2DM9rakiWaSd3PexQsa3DPo1PaK2DLf4ywRbf3F0"
  }
}
```

An invalid userID or password results in a 401 error.

```javascript
{
  "statusCode": 401,
  "statusMessage": "Unauthorized",
  "statusDescription": "User isn't authorized to access this resource",
  "result": {
    "reason": "Invalid credentials"
  }
}
```

```javascript
{
  "statusCode": 503,
  "statusMessage": "Service Unavailable",
  "statusDescription": "The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. The implication is that this is a temporary condition which will be alleviated after some delay",
  "result": {
    "reason": "Unavailable auth-svcs instances"
  }
}
```

Status Code | Response String
--- | ---
200 | Success as determined in result block
401 | Unauthorized. User isn't authorized to access this resource
500 |	Internal service error: ```{"error": ""}```
503 | Service Unavailable. Returned by the API gateway when a service instance can't be reached.

[Back](README.md)
