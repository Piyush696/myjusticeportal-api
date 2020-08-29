'use strict';

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
        },
        facilityName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        libraryLink: {
            type: DataTypes.STRING,
            allowNull: true,
        }

    }, {
        tableName: 'facility',
        freezeTableName: true,
        timestamps: true
    });
    return Facility;
};