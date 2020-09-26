const Message = require('../models').Messages;

module.exports = {
    createMessage: function (msg, callback) {
        console.log(msg)
        const data = {
            "message": msg.message,
            "senderId": msg.senderId,
            "receiverId": msg.receiverId
        }
        Message.create(data).then((msg) => {
            callback(msg);
        })
    }
}
