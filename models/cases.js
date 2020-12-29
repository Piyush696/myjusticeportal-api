'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let Cases = sequelize.define('case', {
        caseId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        legalMatter: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 500],
                    msg: "Legal matter must be between 1 and 500 characters in length"
                }
            }
        },
        countyOfArrest: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        stateOfArrest: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 50],
                    msg: "state Of Arrest must be between 1 and 50 characters in length"
                }
            }
        },
        dateOfArrest: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        briefDescriptionOfChargeOrLegalMatter: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 500],
                    msg: "Brief Description Of Charge Or Legal Matter must be between 3 and 500 characters in length"
                }
            }

        },
        attorneyName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        nextCourtDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        otherInformation: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        notes: {
            type: DataTypes.STRING(5000),
            allowNull: true,
        }
    }, {
        tableName: 'case',
    });


    return Cases;
};