// /backend/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('❌ Error:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de duplicado
  if (err.code === 11000) {
    const message = 'Ya existe un registro con ese nombre';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de ObjectId inválido
  if (err.name === 'CastError') {
    const message = 'ID no válido';
    error = {
      message,
      statusCode: 400
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;