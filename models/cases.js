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
            allowNull: false,
        },
        dateOfArrest: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        caseRelatedTo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        caseJurisdiction: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nextCourtDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        legalRepresentation: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'case',
        freezeTableName: true
    });


    return Cases;
};