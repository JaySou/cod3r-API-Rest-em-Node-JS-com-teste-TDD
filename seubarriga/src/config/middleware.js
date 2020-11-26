const bodyParse = require('body-parser');
const knexLogger = require('knex-logger');

module.exports = app => {
  app.use(bodyParse.json());
  app.use(knexLogger(app.db));
};
