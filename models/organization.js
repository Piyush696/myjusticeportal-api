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
        },
        type: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        speciality: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        tagline: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(5000),
            allowNull: false
        }
    }, {
        tableName: 'organization',
        timestamps: true,
        freezeTableName: true
    });
    return Organization;
};