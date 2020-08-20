'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let Twilio = sequelize.define('twilio', {
        twilioId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        accountSid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        authToken: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'twilio',
        freezeTableName: true
    });


    return Twilio;
};