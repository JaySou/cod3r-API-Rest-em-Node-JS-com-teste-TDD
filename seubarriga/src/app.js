const app = require('express')();
const consign = require('consign');
const knex = require('knex');

const knexfile = require('../knexfile');

// TODO criar chaveamento dinamico
app.db = knex(knexfile.test);

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middleware.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.use((err, req, res, next) => {
  const { name, message, stack } = err;
  if (name === 'ValidationError') res.status(400).json({ error: message });
  if (name === 'RecursoIndevidoError') res.status(403).json({ error: message });
  else res.status(500).json({ name, message, stack });
  next(err);
});

module.exports = app;

// app.db
//   .on('query', query => {
//     console.log({ sql: query.sql, bindings: query.bindings ? query.bindings.join(',') : '' });
//   })
//   .on('query-response', response => {
//     console.log(response);
//   })
//   .on('error', error => console.log(error));
