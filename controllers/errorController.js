const errorController = {
    triggerError(req, res, next) {
      try {
        // Intentionally throw an error
        throw new Error('This is an intentionally triggered error.');
      } catch (error) {
        // Pass the error to the next middleware (the error handler)
        next(error);
      }
    },
  };
  
  module.exports = errorController;