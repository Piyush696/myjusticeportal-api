'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let StripeConnection = sequelize.define('stripeConnection', {
        stripeId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        authKey: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        productId: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'stripeConnection',
        freezeTableName: true
    });


    return StripeConnection;
};