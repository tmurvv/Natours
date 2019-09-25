const AppError = require('./../utils/appError');

/*this function used in app.js inside app.use(). 
When four params in app.use, Express determines 
it is error handling function.*/

const handleJWTError = () =>
    new AppError('Invalid authorization. Please login again.', 401);
const handleJWTExpiredError = () =>
    new AppError('Authorization expired. Please login again.', 401);
const errhandleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
const errhandleDupKeyDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate Value: ${value}`;
    return new AppError(message, 400);
};
const errhandleValidationDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid Input Data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const sendErrorDev = (err, req, res) => {
    // API development error
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack
        });
        // RENDERED website devopment error
    }
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
    });
};
const sendErrorProd = (err, req, res) => {
    //A) Production API Error
    if (req.originalUrl.startsWith('/api')) {
        // Operational error, send error content to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
            // Code or unknown error, log it but do not send to client
        }
        // Log Error
        console.log('Log Error:', err);

        // Send client generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong.'
        });
    }
    // B) Production Operational error, send error content to client
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            status: err.status,
            message: err.message
        });
    }
    // Production not operational Log Error, but do not send to client
    console.log('Log Error:', err);

    // Send client generic message
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong.'
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        error.isOperational = err.isOperational;
        if (err.name === 'CastError') error = errhandleCastErrorDB(error);
        if (err.code === 11000) error = errhandleDupKeyDB(error);
        if (err.name === 'ValidationError')
            error = errhandleValidationDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, req, res);
    }
};
