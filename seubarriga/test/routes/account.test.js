const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;

beforeEach(async () => {
  const res = await app.services.users.save({ name: 'User Tester #1', email: `${Date.now()}@email.com`, password: 'Tester1@123' });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'Segredo!');

  const res2 = await app.services.users.save({ name: 'User Tester #2', email: `${Date.now()}@email.com`, password: 'Tester2@123' });
  user2 = { ...res2[0] };
  user2.token = jwt.encode(user2, 'Segredo!');

});

test('Deve inserir uma conta com sucesso', () => {
  return request(app).post(MAIN_ROUTE)
    .send({ name: 'ACC #1' })
    .set('authorization', `bearer ${user.token}`)
    .then(result => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe('ACC #1');
    });
});

test('Não deve inserir uma conta sem nome', () => {
  return request(app).post(MAIN_ROUTE)
    .send({})
    .set('authorization', `bearer ${user.token}`)
    .then(result => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('O Campo name é obrigatorio para conta');
    });
});

test('Não deve inserir uma conta de nome duplicado para o mesmo usuario', () => {
  return app.db('accounts').insert({ name: 'Acc duplicada', user_id: user.id })
    .then(() => {
      request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user.token}`).send({ name: 'Acc duplicada' })
        .then(res => {
          expect(res.status).toBe(400);
          expect(res.body.error).toBe('Já existe uma conta com esse nome');
        });
    });
});

test('Deve lista apenas as contas de usuario', () => {
  return app.db('accounts').insert([
    { name: 'Acc User #1', user_id: user.id },
    { name: 'Acc User #2', user_id: user2.id },
  ])
    .then(() => {
      request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user.token}`)
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBe(1);
          expect(res.body[0].name).toBe('Acc User #1');

        });
    });
});

test('Deve retornar uma conta por id', () => {
  return app.db('accounts')
    .insert({ name: 'ACC #getById', user_id: user.id }, ['id'])
    .then(acc => request(app)
      .get(`${MAIN_ROUTE}/${acc[0].id}`)
      .set('authorization', `bearer ${user.token}`))
    .then(res => {
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('ACC #getById');
      expect(res.body.user_id).toBe(user.id);
    });
});

test('Não deve retornar conta de outro usuario', () => {
  return app.db('accounts')
    .insert({ name: 'ACC user #2', user_id: user2.id }, ['id'])
    .then(acc => {
      request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
          expect(res.status).toBe(403);
          expect(res.body.error).toBe('Este recurso não pertence ao úsuario');
        });
    });
});

test.skip('Deve alterar uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'ACC #create-update', user_id: user.id }, ['id'])
    .then(acc => {
      return request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
        .send({ name: 'Acc #update Dev alterar uma conta!!!' })
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.name).toBe('Acc #update');
        });
    });
});

test.skip('Deve remover uma conta', () => {
  return app.db('accounts')
    .insert({ name: 'ACC #delete', user_id: user.id }, ['id'])
    .then(acc => {
      return request(app)
        .delete(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
          expect(res.status).toBe(204);
        });
    });
});

test.skip('Não deve alterar conta de outro usuario', () => {
  return app.db('accounts')
    .insert({ name: 'ACC user #2', user_id: user2.id }, ['id'])
    .then(acc => {
      request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
        .send({ name: 'Acc #update' })
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
          expect(res.status).toBe(403);
          expect(res.body.error).toBe('Este recurso não pertence ao úsuario');
        });
    });
});

test.skip('Não deve remover conta de outro usuario', () => {
  return app.db('accounts')
    .insert({ name: 'ACC user #2', user_id: user2.id }, ['id'])
    .then(acc => {
      request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
          expect(res.status).toBe(403);
          expect(res.body.error).toBe('Este recurso não pertence ao úsuario');
        });
    });
});
