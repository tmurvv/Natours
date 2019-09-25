const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');


const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARE
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Set security HTTP headers
app.use(helmet());

//Log some dev info to console
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Limit requests from same IP to prevent denial of service attacks
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

//log developer or production mode to console
console.log(process.env.NODE_ENV);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '10kb'
    })
);
app.use(cookieParser());

// Sanitize data against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross-site scripting)
app.use(xss());

//Prevent parameter polution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);

// For Testing - Add time of request to req object
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);

app.all('*', (req, res, next) => {
    /*if next contains a param Express assumes it is an error and calls error handler*/
    next(new AppError(`${req.originalUrl} not found.`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
