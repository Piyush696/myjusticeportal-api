'use strict';


module.exports = (sequelize, DataTypes) => {
    let Files = sequelize.define('files', {

        fileId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        downloadLink: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
        bucket: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ACL: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'files',
        freezeTableName: true,
        timestamps: true
    }
    );

    return Files;
};
