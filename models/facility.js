'use strict';
const validate = require('validator');

module.exports = (sequelize, DataTypes) => {
    let Facility = sequelize.define('facility', {
        facilityId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        facilityCode: {
            type: DataTypes.STRING(6),
            allowNull: true,
            validate: {
                len: {
                    args: 5,
                    msg: "Facility code must be 5 Characters."
                },
                isAlphanumeric: {
                    msg: 'Facility code must contanis only Numbers and Alphabets'
                }
            }
        },
        facilityName: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: 3,
                    msg: "facility Name must be atleast 3 characters in length"
                }
            }
        },
        libraryLink: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isURL: {
                    msg: "libraryLink  must be a URL"
                }
            }
        }

    }, {
        tableName: 'facility',
        freezeTableName: true,
        timestamps: true
    });
    return Facility;
};