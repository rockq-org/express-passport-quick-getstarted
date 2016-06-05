'use strict';

/**
 * Expose
 */

module.exports = {
  db: process.env.MONGOHQ_URL,
  github: {
    clientID: process.env.GITHUB_CLIENTID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: 'http://nodejs-express-demo.herokuapp.com/auth/github/callback'
  }
};
