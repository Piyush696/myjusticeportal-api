const express = require('express');
const router = express.Router();
const http = require('http').createServer(express);
const io = require('socket.io')(http);

// socket configuration
router.get('/', (req, res) => {
    console.log(req)
    io.on('connection', (socket) => {
        console.log('isConnected', socket)
        socket.on('message', (msg) => {
            console.log(msg);
            socket.broadcast.emit('message-broadcast', msg);
        });
    });

});

module.exports = router; 