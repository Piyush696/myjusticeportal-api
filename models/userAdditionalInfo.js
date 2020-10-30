'use strict';


module.exports = (sequelize, DataTypes) => {
    let UserAdditionalInfo = sequelize.define('userAdditionalInfo', {
        userAdditionalId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tagline: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isSponsored: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }
    }, {
        tableName: 'userAdditionalInfo',
        timestamps: true,
        freezeTableName: true
    });


    return UserAdditionalInfo;
};