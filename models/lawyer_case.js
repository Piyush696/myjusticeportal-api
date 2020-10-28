'use strict';

module.exports = (sequelize, DataTypes) => {
    let lawyer_case = sequelize.define('lawyer_case', {
        lawyer_caseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataTypes.ENUM('Requested', 'Approved', 'Rejected'),
            allowNull: false
        },
        isHide: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
    }, {
        tableName: 'lawyer_case',
        freezeTableName: true
    });
    return lawyer_case;
};