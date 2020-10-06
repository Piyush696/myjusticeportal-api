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
        }
    }, {
        tableName: 'messages',
        timestamps: true
    });


    return Messages;
};