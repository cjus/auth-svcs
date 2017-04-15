/**
* @name auth-v1-api
* @description This module packages the Auth API.
*/
'use strict';

const hydraExpress = require('hydra-express');
const express = hydraExpress.getExpress();
const ServerResponse = require('fwsp-server-response');
const Auth = require('../lib/auth');

/**
* @name sendInvalidUser
* @summary Helper function to return 401
* @param {object} res - express result object
* @param {string} reason - error explaination
* @return {undefined}
*/
function sendInvalidUser(res, reason = 'Invalid credentials') {
  serverResponse.sendInvalidUserCredentials(res, {
    result: {
      isValid: false,
      reason
    }
  });
}

let serverResponse = new ServerResponse();
let api = express.Router();
let auth = new Auth();

/**
* @name Login
* @summary Login route
* @param {object} req - express request object.
* @param {object} res - express response object
*/
api.post('/login', (req, res) => {
  if (!req.body.userName || !req.body.password) {
    sendInvalidUser(res);
    req.log.error('Invalid user credentials');
    return;
  }

  auth.login(req.body.userName, req.body.password)
    .then((result) => {
      if (!result.isValid) {
        sendInvalidUser(res);
        req.log.error('Invalid user credentials');
        return result;
      }
      if (result.isValid) {
        delete result.isValid;
      }
      serverResponse.sendOk(res, {
        result
      });
    })
    .catch((err) => {
      req.log.fatal(err);
      serverResponse.sendServerError(res, {result: {error: err}});
    });
});

/**
* @name Logout
* @summary Logout path.
* @param {object} req - express request object.
* @param {object} res - express response object
*/
api.get('/logout/:token', (req, res) => {
  let token = req.params.token;
  if (!token) {
    serverResponse.sendInvalidRequest(res, {
      reason: 'Missing token'
    });
    return;
  }
  auth.logout(token)
    .then((result) => {
      serverResponse.sendOk(res, {
        result
      });
    })
    .catch((err) => {
      req.log.fatal(err);
      serverResponse.sendServerError(res, {result: {error: err}});
    });
});

/**
* @name Validate
* @summary Validate a token.
* @param {object} req - express request object.
* @param {object} res - express response object
*/
api.get('/validate/:token', (req, res) => {
  let token = req.params.token;
  if (!token) {
    serverResponse.sendInvalidRequest(res, {
      reason: 'Missing token'
    });
    return;
  }
  auth.validate(token)
    .then((result) => {
      serverResponse.sendOk(res, {
        result
      });
    })
    .catch((err) => {
      req.log.fatal(err);
      switch (err.name) {
        case 'TokenExpiredError':
        case 'JsonWebTokenError':
          serverResponse.sendOk(res, {
            result: {
              isValid: false,
              reason: err.message
            }
          });
          return;
        default:
          serverResponse.sendServerError(res, {result: {error: err}});
          return;
      }
    });
});

module.exports = api;
