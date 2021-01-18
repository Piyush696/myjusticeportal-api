'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let defender_case = sequelize.define('defender_case', {
        inmate_defenderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    }, {
        tableName: 'defender_case',
    });


    return defender_case;
};