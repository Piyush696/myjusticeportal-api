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
        },
        other: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lawyerRepresentingMatter: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        selectLawyerRepresenting: {
            type: DataTypes.STRING,
            allowNull: true,
        } ,
        juridictionLegalMatter: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        otherState: {
            type: DataTypes.STRING,
            allowNull: true,
        },
         information1: {
            type: DataTypes.STRING,
            allowNull: true,
        }, 
        information2: {
            type: DataTypes.STRING,
            allowNull: true,
        }, 
        information3: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        information4: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        information5: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        notes: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: 'legalResearch',
        freezeTableName: true
    });


    return legalResearch;
};