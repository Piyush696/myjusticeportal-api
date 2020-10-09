'use strict';

const bcrypt = require('bcrypt');


module.exports = (sequelize, DataTypes) => {
    let legalResearch = sequelize.define('legalResearch', {
        legalResearchId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        whoSentYouToJail: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 500],
                    msg: "Sent to jail must be between 1 and 500 characters in length"
                }
            }
        },
        nextCourtDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        currentCharges: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 500],
                    msg: "Current  Charges must be between 1 and 500 characters in length"
                }
            }
        },
        convicted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        sentenced: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        researchedMatter: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [1, 500],
                    msg: "Research matter must be between 1 and 500 characters in length"
                }
            }
        },
        areYou_Pro_se: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    }, {
        tableName: 'legalResearch',
        freezeTableName: true
    });


    return legalResearch;
};