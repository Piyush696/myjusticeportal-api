'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let inmate_defender = sequelize.define('inmate_defender', {
        inmate_defenderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    }, {
        tableName: 'inmate_defender',
    });


    return inmate_defender;
};