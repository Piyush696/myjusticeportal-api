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
            validate: {
                len: {
                    args: [3, 50],
                    msg: "first Name must be between 3 and 50 characters in length"
                },
                isAlpha: {
                    msg: 'first name must contanis only Alphabets'
                }
            }
        },
        middleName: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [3, 50],
                    msg: "Middle name  must be between 3 and 50 characters in length"
                },
                isAlpha: {
                    msg: 'Middle name must contanis only Alphabets'
                }
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [3, 50],
                    msg: "Last name must be between 3 and 50 characters in length"
                },
                isAlpha: {
                    msg: 'Last name must contanis only Alphabets'
                }
            }
        },
        userName: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                len: {
                    args: [8, 25],
                    msg: "User name must be between 8 and 25 characters in length"
                },
                isAlphanumeric: {
                    msg: 'User name must contanis only Numbers and Alphabets'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: 8,
                    msg: "Password must 8 characters in length"
                }
            }
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
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