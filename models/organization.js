'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    let Organization = sequelize.define('Organization', {
        organizationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 50],
                    msg: "Organization name must be between 1 and 50 characters in length"
                }
            }
        },
        orgCode: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 50],
                    msg: "Organization code must be between 1 and 50 characters in length"
                }
            }
        },
        type: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        specialty: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        tagline: {
            type: DataTypes.STRING(500),
            allowNull: true,
            validate: {
                len: {
                    args: [1, 1000],
                    msg: "Tagline must be between 1 and 1000 characters in length"
                }
            }
        },
        description: {
            type: DataTypes.STRING(5000),
            allowNull: true,
            validate: {
                len: {
                    args: [1, 5000],
                    msg: "Description must be between 1 and 5000 characters in length"
                }
            }
        }
    }, {
        tableName: 'organization',
        timestamps: true,
        freezeTableName: true
    });
    return Organization;
};