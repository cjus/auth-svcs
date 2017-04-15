[Back](README.md)

## GET /v1/auth/validate/:token
Validates a user token.

## Also See
* [GET /v1/auth/login](./api-login-v1.md)
* [GET /v1/auth/logout](./api-logout-v1.md)

### JSON Request

N/A

### JSON Response

Returns `isValid` with true or false, indicating the status of the supplied token.

```javascript
{
  "statusCode": 200,
  "statusMessage": "OK",
  "statusDescription": "Request succeeded without error",
  "result": {
    "isValid": true
  }
}
```

```javascript
{
  "statusCode": 200,
  "statusMessage": "OK",
  "statusDescription": "Request succeeded without error",
  "result": {
    "isValid": false
  }
}
```

```javascript
{
  "statusCode": 200,
  "statusMessage": "OK",
  "statusDescription": "Request succeeded without error",
  "result": {
    "isValid": false,
    "reason": "jwt malformed"
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
409 | Data conflict. Issued when account already exists using the supplied phone number
500 |	Internal service error: ```{"error": ""}```
503 | Service Unavailable. Returned by the API gateway when a service instance can't be reached.

[Back](README.md)
