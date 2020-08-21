'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let user_SecurityQuestion_Answers = sequelize.define('user_securityQuestion_Answers', {
        User_securityQuestion_AnswerId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        answer: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
    }, {
        tableName: 'user_securityQuestion_Answers',
        freezeTableName: true
    });
    return user_SecurityQuestion_Answers;
};