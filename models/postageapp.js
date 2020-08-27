'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    let PostageApp = sequelize.define('postageApp', {
        postageAppId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        apiUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        apiKey: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        project: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        template: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'postageApp',
        freezeTableName: true
    });
    return PostageApp;
};