const express = require('express');
const app = express();



// const server = app.listen(8810)
// const io = require('socket.io').listen(server);
const util = require('../utils/createMessage');
const router = express.Router();

router.get('/', function (req, res, next) {
    console.log('req.body')
    io.on('connection', (socket) => {
        console.log(socket)
        socket.on('message', (msg) => {
            util.createMessage(msg, function (create) {
                if (create) {
                    console.log(msg)
                    socket.broadcast.emit('message-broadcast', msg);
                }
            })
        });
    });
})

module.exports = router;