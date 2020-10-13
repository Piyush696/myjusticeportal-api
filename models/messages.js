'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let Messages = sequelize.define('messages', {
        messageId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        message: {
            type: DataTypes.STRING(1500),
            allowNull: false,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        emailSend: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }
    }, {
        tableName: 'messages',
        timestamps: true
    });


    return Messages;
};