'use strict';

module.exports = (sequelize, DataTypes) => {
    let LibraryLink = sequelize.define('libraryLink', {
        libraryLinkId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        libraryLink: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'libraryLink',
        freezeTableName: true
    });
    return LibraryLink;
};