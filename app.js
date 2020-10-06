const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
var passport = require('passport');

// var app = require('express')();



const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const roleRouter = require('./routes/role');
const socketRouter = require('./routes/socket');

const userRegistrationRoutes = require('./routes/registration/user');
const facilityRegistrationRouter = require('./routes/registration/facility');
const lawyerRegistrationRouter = require('./routes/registration/lawyer');
const paralegalRegistrationRouter = require('./routes/registration/paralegal');
const publicDefenderRegistrationRouter = require('./routes/registration/public-defender');
const bondsmanRegistrationRouter = require('./routes/registration/bondsman');

const bondsmanUserRouter = require('./routes/bondsmanUser');

const bondsmanRouter = require('./routes/bondsman');

const caseRouter = require('./routes/cases');
const postageAppRouter = require('./routes/postageapp');
const twilioRouter = require('./routes/twilio');
const securityQuestionRouter = require('./routes/securityQuestion');
const userMetaRouter = require('./routes/userMeta');
const caseFileRouter = require('./routes/case-file');
const facilityRoutes = require('./routes/facility');


const allUsersLoginRoutes = require('./routes/core/login');

const organizationRouter = require('./routes/organization');
const hireaLawyerRouter = require('./routes/hire-a-lawyer');

const messageRouter = require('./routes/messege');

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'local';

const app = express();

const originsWhitelist = [
    ''
];

originsWhitelist.push('http://localhost:4200');
originsWhitelist.push('http://localhost:8000');
originsWhitelist.push('https://dev-mjp-ui.herokuapp.com');
originsWhitelist.push('https://mjp-ui.herokuapp.com');

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




// Public routes.

app.use('/api/users', authRouter);
app.use('/api/userRegistration', userRegistrationRoutes);
app.use('/api/facility-registration', facilityRegistrationRouter);
app.use('/api/lawyer-registration', lawyerRegistrationRouter);
app.use('/api/paralegal-registration', paralegalRegistrationRouter);
app.use('/api/public-defender-registration', publicDefenderRegistrationRouter);
app.use('/api/bondsman-registration', bondsmanRegistrationRouter);

app.use('/api/login', allUsersLoginRoutes);
// app.use('/api/message', socketRouter);

app.use('/api/bondsman', passport.authenticate('jwt', { session: false }), bondsmanRouter);

app.use('/api/role', roleRouter);
app.use('/api/case', passport.authenticate('jwt', { session: false }), /*roleMiddleware,*/ caseRouter);
app.use('/api/postage', passport.authenticate('jwt', { session: false }), postageAppRouter);
app.use('/api/twilio', passport.authenticate('jwt', { session: false }), twilioRouter);
app.use('/api/hirealawyer', passport.authenticate('jwt', { session: false }), hireaLawyerRouter);
app.use('/api/bondsmanUser', passport.authenticate('jwt', { session: false }), bondsmanUserRouter);
app.use('/api/securityQuestion', securityQuestionRouter);
app.use('/api/user', /*roleMiddleware,*/ usersRouter);
app.use('/api/userMeta', /*roleMiddleware,*/ userMetaRouter);
app.use('/api/case-file', passport.authenticate('jwt', { session: false }), /*roleMiddleware,*/ caseFileRouter);
app.use('/api/facility', passport.authenticate('jwt', { session: false }), facilityRoutes);
app.use('/api/organization', passport.authenticate('jwt', { session: false }), organizationRouter);

app.use('/api/message', passport.authenticate('jwt', { session: false }), messageRouter);

//Private routes.
// app.use(authMiddleware.verifyToken);

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


const router = express.Router();
const http = require('http').createServer(express);


const server = app.listen(8810)
const io = require('socket.io').listen(server);
const util = require('./utils/createMessage');

// socket configuration
router.get('/', (req, res) => { res.send('hello!') });

io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        util.createMessage(msg, function (create) {
            if (create) {
                socket.broadcast.emit('message-broadcast' + msg.receiverId, msg);
            }
        })
    });
});




module.exports = app;