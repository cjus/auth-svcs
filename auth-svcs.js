/**
* @name Auth
* @summary Auth Service Entry Point
*/
'use strict';

const version = require('./package.json').version;
const hydraExpress = require('hydra-express');
const jwtAuth = require('fwsp-jwt-auth');
const HydraExpressLogger = require('fwsp-logger').HydraExpressLogger;
hydraExpress.use(new HydraExpressLogger());
let config = require('fwsp-config');
const mdb = require('./lib/mdb');

/**
* Load configuration file and initialize hydraExpress app
*/
config.init('./config/config.json')
  .then(() => {
    config.version = version;
    return jwtAuth.loadCerts(config.privateCert, config.publicCert);
  })
  .then(() => {
    return hydraExpress.init(config.getObject(), version, () => {
      hydraExpress.registerRoutes({
        '/v1/auth': require('./routes/auth-v1-routes')
      });
    });
  })
  .then((serviceInfo) => {
    console.log('serviceInfo', serviceInfo);

    // init mongodb client connection
    mdb.open(config.mongodb.connectionString);
  })
  .catch((err) => {
    console.log('err', err);
  });
