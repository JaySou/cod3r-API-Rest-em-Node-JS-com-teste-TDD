const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/users';

const email = `${Date.now()}@email.com`;
let user;

beforeAll(async () => {
  const res = await app.services.users.save({ name: 'User Tester', email: `${Date.now()}@email.com`, password: 'Tester@123' });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');
});

test('Deve lista os usuarios', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
});

test('Deve inserir usuario com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter', email, password: 'Teste@1234' })
    .set('authorization', `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Walter');
      expect(res.body).not.toHaveProperty('password');
    });
});

test('Deve armazenar a senha cryptografada', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter', email: `${Date.now()}@email.com`, password: 'Teste@1234' })
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(201);
  const { id } = res.body;
  const userDb = await app.services.users.findOne({ id });
  expect(userDb.password).not.toBeUndefined();
  expect(userDb.password).not.toBe('Teste@1234');
});

test('Não deve inserir usuario sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ email, password: 'Teste@1234' })
    .set('authorization', `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatorio');
    });
});

test('Não deve inserir usuario sem e-mail', async () => {
  const result = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter', password: 'Teste@1234' })
    .set('authorization', `bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email é um atributo obrigatorio');
});

test('Não deve insserir usuario sem senha', (done) => {
  request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter', email })
    .set('authorization', `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password é um atributo obrigatorio');
      done();
    });
});

test('Não deve inserir ususario com e-mail existente', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'Walter', email: 'email@email.com', password: 'Teste@1234' })
    .set('authorization', `bearer ${user.token}`)
    .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('O e-mail informado já está cadastrado');
    });
});
