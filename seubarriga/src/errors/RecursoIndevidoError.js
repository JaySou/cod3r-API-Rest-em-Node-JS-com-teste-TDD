module.exports = function RecursoIndevidoError(message = 'Este recurso não pertence ao úsuario') {
  this.name = 'RecursoIndevidoError';
  this.message = message;
};
