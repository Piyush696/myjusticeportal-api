'use strict';

module.exports = (sequelize, DataTypes) => {
    let file_case = sequelize.define('file_case', {
        file_caseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.ENUM('shared', 'private'),
            defaultValue: 'private',
            allowNull: false
        }
    }, {
        tableName: 'file_case',
        freezeTableName: true
    });
    return file_case;
};