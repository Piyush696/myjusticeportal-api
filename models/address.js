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
            allowNull: false,
            validate: {
                len: {
                    args: [1, 100],
                    msg: "Street 1 must be between 1 and 100 characters in length"
                }
            }
        },
        street2: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 50],
                    msg: "City must be between 1 and 50 characters in length"
                }
            }
        },
        state: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 50],
                    msg: "State must be between 1 and 50 characters in length"
                }
            }
        },
        zip: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 20],
                    msg: "Zip  must be between 1 and 20 characters in length"
                }
            }
        },
        country: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 50],
                    msg: "Country must be between 1 and 50 characters in length"
                }
            }
        }
    }, {
        tableName: 'address',
        freezeTableName: true,
        timestamps: true
    });
    return Address;
};