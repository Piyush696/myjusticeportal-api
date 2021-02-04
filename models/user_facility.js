'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    let user_facility = sequelize.define('user_facility', {
        user_facilityId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        }
    }, {
        tableName: 'user_facility',
        freezeTableName: true,
        timestamps: true
    });
    return user_facility;
};