const Message = require('../models').Messages;

module.exports = {
    createMessage: function (msg, callback) {
        const data = {
            "message": msg,
            "senderId": 5,
            "receiverId": 6
        }
        Message.create(data).then((msg) => {
            callback(msg);
        })
    }
}
