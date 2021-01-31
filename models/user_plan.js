'use strict';
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    let user_plan = sequelize.define('user_plan', {
        user_planId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        plan: {
            type: DataTypes.ENUM('Up to 5 Connections', 'Up to 25 Connections', 'Unlimited Connections'),
            allowNull: false
        },
        totalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: false
        },
        coupon: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: false
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }
    }, {
        tableName: 'user_plan',
        freezeTableName: true,
        timestamps: true
    });
    return user_plan;
};