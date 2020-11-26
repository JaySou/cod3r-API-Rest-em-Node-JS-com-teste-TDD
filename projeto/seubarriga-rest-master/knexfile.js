module.exports = {
  test: {
    client: 'pg',
    version: '12.3',
    connection: {
      host: 'localhost',
      user: 'docker',
      password: 'docker',
      database: 'barriga',
    },
    migrations: { directory: 'src/migrations' },
    seeds: { directory: 'src/seeds' },
  },
  prod: {
    client: 'pg',
    version: '12.3',
    connection: {
      host: 'localhost',
      user: 'docker',
      password: 'docker',
      database: 'seubarriga_prd',
    },
    migrations: { directory: 'src/migrations' },
  },
};
