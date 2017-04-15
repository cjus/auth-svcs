# auth-svcs
An authentication microservice which uses [JSON Web Tokens](https://en.wikipedia.org/wiki/JSON_Web_Token) - an industry standard for representing claims between multiple parties (such as microservices).  [RSA Public/Private](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) 1024-bit certificates are used to secure the claims.

This service uses [MongoDB](https://www.mongodb.com/) as a backend database - but can be changed to use any data store.

***Value proposition***

* Authentication is a highly common thing to want to do within a distributed system.
  * It makes sense for this functionality to be its own service.
* Intended to work with the [hydra-router](https://github.com/flywheelsports/hydra-router) so that auth requests can be handled by an auth service (cluster).
* Returns a JSON Web Token which can be validated by other services using the `auth` public key and the [fwsp-jwt-auth](https://www.npmjs.com/package/fwsp-jwt-auth) module.

See the [hello-auth-service](https://github.com/cjus/hello-auth-service) for an example microservice which works with this auth-svcs.

## Building

```shell
$ npm install
```

## Usage

The auth-svcs is a [hydra-express](https://github.com/flywheelsports/hydra-express) enabled service. As such it can be located via [Hydra service discovery](https://github.com/flywheelsports/hydra#service-discovery) using the name `auth-svcs`. Additionally, auth related endpoints can be proxied through a [hydra-router](https://github.com/flywheelsports/hydra-router).

### Requirements

This auth service requires an accessible Redis instance - that is a [Hydra-Express requirement](https://www.hydramicroservice.com/docs/quick-start/step1.html). A MongoDB instance is also required but can be swapped out for the database of your choice by replacing the Mongo specific code in `lib/auth.js`.

### config.json
Auth expects to load a `config.json` file on startup. The file should be placed in the config folder. Use the config file to specify the location of public/private key certificates (more on those shortly) and the location of your Redis instance and Mongo database.

```javascript
{
  "environment": "development",
  "publicCert": "./config/service.pub",
  "privateCert": "./config/service.pem",
  "jwtPublicCert": "./config/service.pub",
  "mongodb": {
    "connectionString": "mongodb://localhost:27017/auth"
  },
  "hydra": {
    "serviceName": "auth-svcs",
    "serviceIP": "",
    "servicePort": 1337,
    "serviceType": "authentication",
    "serviceDescription": "Authentication service",
    "plugins": {
      "logger": {
        "logRequests": true,
        "redact": ["password"],
        "elasticsearch": {
          "host": "localhost",
          "port": 9200,
          "index": "hydra"
        }
      }
    },
    "redis": {
      "url": "redis://127.0.0.1:6379/15"
    }
  }
}
```

This auth service can log to an ELK stack. To enable support, install the pino-elasticsearch package.

```shell
$ npm install -g pino-elasticsearch
```

### DB setup

The auth service expects a MongoDB instance with a database called `auth` and a collection called `user`.  You can add a sample document using:

```
db.user.insert({
  uid: 'b1593f81-3645-4437-a656-3ec333a6cfcc',
  roles: ['admin', 'developer'],
  userName: 'cjus',
  firstName: 'Carlos',
  lastName: 'Justiniano',
  password: hex_md5('password')
})
```

The uid can be any user id you'd like, I've chosen a random UUID as an example. The `roles` array is useful for assigning user roles that you can later check for.

### Scripts

This repo includes several handy shell scripts to create the digital certificates and to test login, logout, and token validation. Scripts are available in the `./scripts` folder.

#### Creating private and public certificates

You can use the supplied `./scripts/keygen.sh` script to create certificates for use with jwt-auth.

```shell
$ cd scripts
$ ./keygen.sh
```

The script shown below uses OpenSSL to generate an RSA 1024bit `service.pem` private key. It then uses OpenSSL to create a `service.pub` public key for use by other services.  That's the key that you distribute with your hydra-express applications which require JWT token validation.  The script concludes by securing the permissions on the service.pem file and copying both the service.pem and service.pub files to the config folder - where they're referenced by the config.json file.

```
openssl genrsa -out service.pem 1024
openssl rsa -in service.pem -pubout > service.pub
chmod 600 service.pem
mv service* ../config
```

#### API test scripts

Also included in the scripts folder are three shell scripts which use the curl command line utility to call the running auth service. 

* login.sh
* logout.sh
* validate.sh
* call-hello-auth.sh

The scripts offer a quick way of testing your running service and illustrating the use of the APIs.

**login and get token** - login.sh

```shell
$ ./login.sh cjus password
{"statusCode":200,"statusMessage":"OK","statusDescription":"Request succeeded without error","result":{"uid":"b1593f81-3645-4437-a656-3ec333a6cfcc","token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiMTU5M2Y4MS0zNjQ1LTQ0MzctYTY1Ni0zZWMzMzNhNmNmY2MiLCJyb2xlcyI6WyJhZG1pbiIsImRldmVsb3BlciJdLCJ1c2VyTmFtZSI6ImNqdXMiLCJmaXJzdE5hbWUiOiJDYXJsb3MiLCJsYXN0TmFtZSI6Ikp1c3Rpbmlhbm8iLCJpc3N1ZXIiOiJ1cm46YXV0aCIsImV4cCI6MTQ5MjI4NTU2OCwiaWF0IjoxNDkyMjgxOTY4fQ.JVgvu7hsPKSz8dN6CYUni1Q7SxmiEp_et5DGH0B0wSXnpWJPprF-07d7T_FVjLCPSayi9OTZBM75RrARExTxeEdQBTqhMghHRfd-rYrr63dS7ulfqEuOh2i9h-kaNQ0adVqsvly5KlaXE_WhbcihXcJfwYOOAxEQHGaYXpqufg0"}}
```

**validate token** - validate.sh

```shell
$ ./validate.sh eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiMTU5M2Y4MS0zNjQ1LTQ0MzctYTY1Ni0zZWMzMzNhNmNmY2MiLCJyb2xlcyI6WyJhZG1pbiIsImRldmVsb3BlciJdLCJ1c2VyTmFtZSI6ImNqdXMiLCJmaXJzdE5hbWUiOiJDYXJsb3MiLCJsYXN0TmFtZSI6Ikp1c3Rpbmlhbm8iLCJpc3N1ZXIiOiJ1cm46YXV0aCIsImV4cCI6MTQ5MjI4NTU2OCwiaWF0IjoxNDkyMjgxOTY4fQ.JVgvu7hsPKSz8dN6CYUni1Q7SxmiEp_et5DGH0B0wSXnpWJPprF-07d7T_FVjLCPSayi9OTZBM75RrARExTxeEdQBTqhMghHRfd-rYrr63dS7ulfqEuOh2i9h-kaNQ0adVqsvly5KlaXE_WhbcihXcJfwYOOAxEQHGaYXpqufg0
{"statusCode":200,"statusMessage":"OK","statusDescription":"Request succeeded without error","result":{"isValid":true}}
```

**call hello-auth-service using token** - call-hello-auth.sh

```shell
./call-hello-auth.sh eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJiMTU5M2Y4MS0zNjQ1LTQ0MzctYTY1Ni0zZWMzMzNhNmNmY2MiLCJyb2xlcyI6WyJhZG1pbiIsImRldmVsb3BlciJdLCJ1c2VyTmFtZSI6ImNqdXMiLCJmaXJzdE5hbWUiOiJDYXJsb3MiLCJsYXN0TmFtZSI6Ikp1c3Rpbmlhbm8iLCJpc3N1ZXIiOiJ1cm46YXV0aCIsImV4cCI6MTQ5MjI4NTU2OCwiaWF0IjoxNDkyMjgxOTY4fQ.JVgvu7hsPKSz8dN6CYUni1Q7SxmiEp_et5DGH0B0wSXnpWJPprF-07d7T_FVjLCPSayi9OTZBM75RrARExTxeEdQBTqhMghHRfd-rYrr63dS7ulfqEuOh2i9h-kaNQ0adVqsvly5KlaXE_WhbcihXcJfwYOOAxEQHGaYXpqufg0
{"statusCode":200,"statusMessage":"OK","statusDescription":"Request succeeded without error","result":{"greeting":"Now we can share some secrets!"}}
```

Calling the hello-auth-service without a valid token (including an expired token) results in:

```javascript
{
  "statusCode": 401,
  "statusMessage": "Unauthorized",
  "statusDescription": "User isn't authorized to access this resource",
  "result": {
    "reason": "invalid signature"
  }
}
```

See the [hello-auth-service](https://github.com/cjus/hello-auth-service) for an example microservice which works with this auth-svcs.

## Use with Docker

The auth service can be built and deployed using Docker. The first parameter below is your dockerhub username and the second is the container name and versions.

```
$ ./dockerbuild.sh cjus auth-svcs:0.0.1
```

Using the service in a Docker container does introduce considerations regarding how the config.json file is managed. See: https://www.hydramicroservice.com/docs/docker/using-hydra-with-docker.html

## Service Endpoints

The auth-service exposes the following endpoints:

| Name | Address | Usage
| --- | --- | ---
| login | /v1/auth/login | Login using userID and password to obtain a JWT
| logout | /v1/auth/logout/:token | Log out using JWT token
| validate | /v1/auth/validate/:token | Validate a JWT (including expiration)

Documentation for the service endpoints [documentation](./documentation/README.md) folder.

