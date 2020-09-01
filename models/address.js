'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    let Address = sequelize.define('Address', {
        addressId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        street1: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        street2: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        state: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        zip: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        country: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        tableName: 'address',
        freezeTableName: true,
        timestamps: true
    });
    return Address;
};