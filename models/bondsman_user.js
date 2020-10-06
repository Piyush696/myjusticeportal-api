'use strict';

module.exports = (sequelize, DataTypes) => {
    let bondsman_user = sequelize.define('bondsman_user', {
        bondsman_userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.ENUM('Requested', 'Approved', 'Rejected'),
            allowNull: false
        }
    }, {
        tableName: 'bondsman_user',
        freezeTableName: true
    });
    return bondsman_user;
};