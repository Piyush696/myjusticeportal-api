'use strict';

module.exports = (sequelize, DataTypes) => {
    let lawyer_case = sequelize.define('lawyer_case', {
        status: {
            type: DataTypes.ENUM('Requested', 'Approved', 'Rejected'),
            allowNull: false
        }
    }, {
        tableName: 'lawyer_case',
        freezeTableName: true
    });
    return lawyer_case;
};