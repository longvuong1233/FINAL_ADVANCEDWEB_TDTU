const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'web'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb+srv://vuminh:vuminh@cluster0.c8wkb.mongodb.net/web?retryWrites=true&w=majority'
  },

  test: {
    root: rootPath,
    app: {
      name: 'web'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/web-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'web'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/web-production'
  }
};

module.exports = config[env];
