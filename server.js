const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

//Safety net for uncaught exceptions. Try to hanlde all errors specifically
process.on('uncaughtException', err => {
    console.log('Uncaught Exception. Shutting down...');
    console.log(err.name, err.message);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB connection successful'));

//start server
const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`app running on port ${port}...`);
});

//The next two process on is
process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection. Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
