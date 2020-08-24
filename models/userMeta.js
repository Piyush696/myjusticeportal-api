'use strict';


module.exports = (sequelize, DataTypes) => {
    let UserMeta = sequelize.define('userMeta', {
        userMetaId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        metaKey: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        metaValue: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.INTEGER,
        },
        updatedBy: {
            type: DataTypes.INTEGER,
        },
    }, {
            tableName: 'userMeta',
            timestamps: true,
            freezeTableName: true
        });


    return UserMeta;
};