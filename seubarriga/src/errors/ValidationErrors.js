module.exports = function ValidationErrors(message) {
  this.name = 'ValidationError';
  this.message = message;
};
