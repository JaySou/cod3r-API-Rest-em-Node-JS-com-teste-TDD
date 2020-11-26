const express = require('express');

module.exports = app => {

  const router = express.Router();

  router.get('/', (req, res, next) => {
    app.services.users.findAll()
      .then(result => res.status(200).json(result))
      .catch(err => next(err));
  });

  router.post('/', async (req, res) => {
    try {
      const result = await app.services.users.save(req.body);
      return res.status(201).json(result[0]);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  return router;
};
