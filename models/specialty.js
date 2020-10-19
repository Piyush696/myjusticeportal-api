'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let Specialty = sequelize.define('specialty', {
        SpecialtyId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        specialtyType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 50],
                    msg: "Specialty Type must be between 1 and 50 characters in length"
                }
            }
        }
    }, {
        tableName: 'specialty',
    });


    return Specialty;
};