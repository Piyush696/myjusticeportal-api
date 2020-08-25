'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let User = sequelize.define('user', {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userName: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        securityQuestionAnswered: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        countryCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        authCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isMFA: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        tableName: 'user',
        paranoid: true,
        timestamps: true,
        freezeTableName: true
    });

    User.generateHash = function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    User.prototype.isValidPassword = function (password) {
        return bcrypt.compareSync(password, this.password)
    };

    User.prototype.toJSON = function () {
        let values = Object.assign({}, this.get());

        delete values.password;
        delete values.createdBy;

        return values;
    };

    return User;
};