// middleware/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
    console.error('Caught an intentional error:', err);
  
    res.status(500).render('errors/500', {
      title: 'Server Error',
      message: 'We apologize, but an unexpected error occurred on our server.',
    });
  };
  
  module.exports = errorHandler;