const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
var passport = require('passport');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const roleRouter = require('./routes/role');

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'local';

const app = express();


const originsWhitelist = [
    ''
];


originsWhitelist.push('http://localhost:4200');
originsWhitelist.push('http://localhost:4100');
originsWhitelist.push('http://localhost:8000');
originsWhitelist.push('https://dev-mjp-ui.herokuapp.com');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Enabling CORS

app.use(cors({
    origin: (origin, callback) => {
        const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;

        callback(null, isWhitelisted);
    },
    credentials: true
}));

app.use(passport.initialize());
require('./config/passport')(passport);

//Public routes
app.use('/api/users', authRouter);
app.use('/api/role', roleRouter);

//Private routes.
// app.use(authMiddleware.verifyToken);

app.use('/api/user', /*roleMiddleware,*/ usersRouter);




// error handler, don't remove next
app.use(function (err, req, res, next) {
    let errorCode = '';
    const errorCodes = [
        'MISSING_USERNAME',
        'MISSING_PASSWORD',
        'INVALID_USERNAME',
        'INVALID_PASSWORD',
        'INVALID_EMAIL',
        'PERMISSION_DENIED',
        'MISSING_EMAIL',
    ];

    switch (err.name) {
        case 'TokenExpiredError':
            errorCode = 'expired_token';
            break;

        case 'JsonWebTokenError':
            errorCode = 'invalid_token';
            break;

        case 'SequelizeUniqueConstraintError':
            errorCode = 'duplicated_' + Object.keys(err.fields)[0];
            break;

        case 'SequelizeDatabaseError':
            errorCode = 'invalid_inputs';
            break;

        default:
            errorCode = 'unrecognized';
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        errorCode = 'INCORRECT_FILE_SIZE';
    }

    if (err.message && errorCodes.includes(err.message.toUpperCase())) {
        errorCode = err.message;
    }

    res.json({
        success: false,
        error: {
            name: errorCode.toUpperCase()
        }
    });
});

module.exports = app;
