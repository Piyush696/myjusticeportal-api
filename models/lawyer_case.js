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
            type: DataTypes.ENUM('Lawyer Requested', 'Lawyer Approved', 'Lawyer Rejected', 'Inmate Rejected', 'Connected', 'Disconnected'),
            allowNull: false
        },
        isHide: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        notes: {
            type: DataTypes.STRING(5000),
            allowNull: true,
        }
    }, {
        tableName: 'lawyer_case',
        freezeTableName: true
    });
    return lawyer_case;
};