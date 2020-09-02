'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    let Organization = sequelize.define('Organization', {
        organizationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        orgCode: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    }, {
        tableName: 'organization',
        timestamps: true,
        freezeTableName: true
    });
    return Organization;
};