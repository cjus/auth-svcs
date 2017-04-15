'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const Utils = require('fwsp-jsutils');
const jwtAuth = require('fwsp-jwt-auth');
const mdb = require('../lib/mdb');

/**
* @name Auth
* @summary auth class library
*/
class Auth {
  /**
  * @name constructor
  * @summary Auth constructor
  * @return {undefined}
  */
  constructor() {
  }

  /**
  * @name login
  * @summary login validating userName and password
  * @param {string} userName - user name
  * @param {string} password - password
  * @return {object} promise - resolves to result or error
  */
  login(userName, password) {
    return new Promise((resolve, reject) => {
      let userDoc;
      let hashedPassword = Utils.md5Hash(password);
      let user = mdb.getCollection('user');
      user.findOneAsync({userName: userName, password: hashedPassword}, {_id: 0, uid: 1, userName: 1, roles: 1, firstName: 1, lastName: 1})
        .then((result) => {
          if (!result) {
            resolve({
              isValid: false
            });
            return;
          }
          userDoc = result;
          return jwtAuth.createToken(userDoc);
        })
        .then((token) => {
          let ts = moment().unix();
          let doc = {
            $set: {
              lastAccessedAt: ts,
              lastLogin: ts,
              shortToken: jwtAuth.getTokenHash(token),
              token: token
            }
          };
          user.updateOneAsync({userName: userName, password: hashedPassword}, doc)
            .then(() => {
              resolve({
                isValid: (userDoc !== null),
                uid: userDoc.uid,
                token: token
              });
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  /**
  * @name logout
  * @summary logout user with valid token
  * @param {string} token - JWT token
  * @return {object} promise - resolves to result or error
  */
  logout(token) {
    return new Promise((resolve, reject) => {
      let user = mdb.getCollection('user');
      let shortToken = jwtAuth.getTokenHash(token);
      let doc = {
        $set: {
          shortToken: '',
          token: ''
        }
      };
      user.updateOneAsync({shortToken: shortToken}, doc)
        .then(() => {
          resolve({});
        })
        .catch((err) => reject(err));
    });
  }

  /**
  * @name validate
  * @summary validate the user token
  * @param {string} token - JWT token
  * @return {object} promise - resolves to result or error
  */
  validate(token) {
    return new Promise((resolve, reject) => {
      jwtAuth.verifyToken(token)
        .then(() => {
          let user = mdb.getCollection('user');
          let shortToken = jwtAuth.getTokenHash(token);
          user.findOneAsync({shortToken: shortToken})
            .then((result) => {
              resolve({
                isValid: (result !== null)
              });
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }
}

module.exports = Auth;
