'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let SecurityQuestion = sequelize.define('securityQuestion', {
        securityQuestionId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'securityQuestion',
        freezeTableName: true
    });


    return SecurityQuestion;
};