'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let Cases = sequelize.define('case', {
        caseId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        countyOfArrest: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dateOfArrest: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        briefDescriptionOfChargeOrLegalMatter: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        attorneyName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        nextCourtDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        otherInformation: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'case',
        freezeTableName: true
    });


    return Cases;
};