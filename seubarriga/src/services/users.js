const bcrypt = require('bcrypt-nodejs');

const ValidationErrors = require('../errors/ValidationErrors');

module.exports = app => {

  const findAll = (filter = {}) => app.db('users').where(filter).select(['id', 'name', 'email']);

  const findOne = (filter = {}) => {
    return app.db('users').where(filter).select().first();
  };

  const getPassHash = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationErrors('Nome é um atributo obrigatorio');
    if (!user.email) throw new ValidationErrors('Email é um atributo obrigatorio');
    if (!user.password) throw new ValidationErrors('Password é um atributo obrigatorio');

    const userDb = await findOne({ email: user.email });
    if (userDb) throw new ValidationErrors('O e-mail informado já está cadastrado');

    const newUser = { ...user };
    newUser.password = getPassHash(user.password);
    return app.db('users').insert(newUser, ['id', 'name', 'email']);
  };

  return { findAll, findOne, save };
};
