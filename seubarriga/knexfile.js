module.exports = {
  test: {
    client: 'pg',
    version: 12.3,
    connection: {
      host: 'localhost',
      user: 'docker',
      password: 'docker',
      database: 'barriga',
    },
    migrations: {
      directory: 'src/migrations',
    },
  },
};
