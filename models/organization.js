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
                    args: [1, 100],
                    msg: "Organization name must be between 1 and 100 characters in length"
                }
            }
        },
        orgCode: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: {
                    args: [1, 100],
                    msg: "Organization code must be between 1 and 100 characters in length"
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
                    args: [0, 1000],
                    msg: "Tagline must be less than 1000 characters in length"
                }
            }
        },
        colorPiker: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(5000),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 5000],
                    msg: "Description must be less than 5000 characters in length"
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