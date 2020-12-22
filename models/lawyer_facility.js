'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    let Lawyer_facility = sequelize.define('lawyer_facility', {
        lawyer_facilityId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        planSelected: {
            type: DataTypes.ENUM('Up to 5 Connections', 'Up to 25 Connections', 'Unlimited Connections'),
            allowNull: false
        },
        isSelected: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        isSponsors: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        isPremium: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }
    }, {
        tableName: 'lawyer_facility',
        freezeTableName: true,
        timestamps: true
    });
    return Lawyer_facility;
};