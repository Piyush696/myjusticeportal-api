'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let defender_facility = sequelize.define('defender_facility', {
        defender_facilityId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        isSelected: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
    }, {
        tableName: 'defender_facility',
    });


    return defender_facility;
};