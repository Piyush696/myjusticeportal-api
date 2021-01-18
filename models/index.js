'use strict';

const Sequelize = require('sequelize');
let config = require(__dirname + '/../config/db-config');

let db = {};
let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/* Models */

db.Organization = require('./organization')(sequelize, Sequelize);
db.Address = require('./address')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.Role = require('./role')(sequelize, Sequelize);
db.Case = require('./cases')(sequelize, Sequelize);
db.Postage = require('./postageapp')(sequelize, Sequelize);
db.Twilio = require('./twilio')(sequelize, Sequelize);
db.SecurityQuestion = require('./securityQuestion')(sequelize, Sequelize);
db.User_SecurityQuestion_Answers = require('./user_securityQuestion_Answers')(sequelize, Sequelize);
db.UserMeta = require('./userMeta')(sequelize, Sequelize);
db.Files = require('./files')(sequelize, Sequelize);
db.Facility = require('./facility')(sequelize, Sequelize);
db.lawyer_case = require('./lawyer_case')(sequelize, Sequelize);
db.bondsman_user = require('./bondsman_user')(sequelize, Sequelize);
db.file_case = require('./file_case')(sequelize, Sequelize);
db.Messages = require('./messages')(sequelize, Sequelize);
db.Specialty = require('./specialty')(sequelize, Sequelize);
db.LegalResearch = require('./legalResearch')(sequelize, Sequelize);
db.StripeConnection = require('./stripe_connection')(sequelize, Sequelize);
db.UserAdditionalInfo = require('./userAdditionalInfo')(sequelize, Sequelize);

db.lawyer_facility = require('./lawyer_facility')(sequelize, Sequelize);
db.defender_case = require('./defender_case')(sequelize, Sequelize);
db.defender_facility = require('./defender_facility')(sequelize, Sequelize);

/* Mapings */

db.Organization.hasMany(db.User, { foreignKey: 'organizationId', sourceKey: 'organizationId' });
db.User.belongsTo(db.Organization, { foreignKey: 'organizationId', sourceKey: 'organizationId' });
db.Organization.belongsTo(db.Address, { foreignKey: 'addressId' });
db.Address.hasOne(db.Organization, { foreignKey: 'addressId' });

// db.Files.hasMany(db.Organization, { as: 'logo', foreignKey: 'logoFileId' });
db.Organization.belongsTo(db.Files, { as: 'logo', foreignKey: 'logoFileId' });

db.UserAdditionalInfo.belongsTo(db.Files, { as: 'profile', foreignKey: 'ProfileImgId' });
db.UserAdditionalInfo.belongsTo(db.Files, { as: 'header', foreignKey: 'headerImgId' });

db.Messages.belongsTo(db.User, { as: 'sender', foreignKey: 'senderId' });
db.Messages.belongsTo(db.User, { as: 'receiver', foreignKey: 'receiverId' });
// db.Messages.hasOne(db.User, { as: 'receiver', foreignKey: 'userId' });

db.LegalResearch.belongsTo(db.User, { as: 'researcher', foreignKey: 'researcherId' });
db.LegalResearch.belongsTo(db.Files, { as: 'researcherFile', foreignKey: 'researcherFileId' });

db.bondsman_user.belongsTo(db.User, { as: 'bondsman', foreignKey: 'bondsmanId' });
db.bondsman_user.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

db.User.belongsToMany(db.Role, { through: 'user_role', foreignKey: 'userId' });
db.Role.belongsToMany(db.User, { through: 'user_role', foreignKey: 'roleId' });

db.SecurityQuestion.belongsTo(db.Role, { foreignKey: 'roleId', sourceKey: 'roleId' });

db.User.belongsToMany(db.SecurityQuestion, { through: 'user_securityQuestion_Answers', foreignKey: 'userId' });
db.SecurityQuestion.belongsToMany(db.User, { through: 'user_securityQuestion_Answers', foreignKey: 'securityQuestionId' });

db.User.hasMany(db.UserMeta, { foreignKey: 'userId', sourceKey: 'userId' });
db.User.hasOne(db.UserAdditionalInfo, { foreignKey: 'userId', sourceKey: 'userId' });

db.LegalResearch.belongsTo(db.User, { as: 'inmate', foreignKey: 'userId', sourceKey: 'userId' });

db.Case.belongsTo(db.User, { as: 'inmate', foreignKey: 'userId', sourceKey: 'userId' });

db.User.hasMany(db.Case, { foreignKey: 'userId', sourceKey: 'userId' });

db.Files.belongsTo(db.User, { as: 'createdBy', constraints: false });
db.Case.belongsToMany(db.Files, { as: 'caseFile', through: 'file_case', foreignKey: 'caseId' });
db.Files.belongsToMany(db.Case, { through: 'file_case', foreignKey: 'fileId' });

db.Facility.belongsToMany(db.Organization, { through: 'org_facility', foreignKey: 'facilityId' });
db.Organization.belongsToMany(db.Facility, { through: 'org_facility', foreignKey: 'organizationId' });

db.Facility.belongsTo(db.Address, { foreignKey: 'addressId' });

db.Facility.belongsToMany(db.User, { through: 'user_facility', foreignKey: 'facilityId' });
db.User.belongsToMany(db.Facility, { through: 'user_facility', foreignKey: 'userId' });

db.User.belongsToMany(db.Facility, { as: 'lawyerFacility', through: 'lawyer_facility', foreignKey: 'lawyerId' });
db.Facility.belongsToMany(db.User, { as: 'lawyerFacility', through: 'lawyer_facility', foreignKey: 'facilityId' });


db.User.belongsToMany(db.Facility, { as: 'defender', through: 'defender_facility', foreignKey: 'defenderId' });
db.Facility.belongsToMany(db.User, { as: 'defender', through: 'defender_facility', foreignKey: 'facilityId' });


db.User.belongsToMany(db.Case, { as: 'lawyer', through: 'lawyer_case', foreignKey: 'lawyerId' });
db.Case.belongsToMany(db.User, { through: 'lawyer_case', foreignKey: 'caseId' });

db.User.belongsToMany(db.Case, { as: 'publicdefender', through: 'defender_case', foreignKey: 'publicdefenderId' });
db.Case.belongsToMany(db.User, { as: 'publicdefender', through: 'defender_case', foreignKey: 'caseId' });


module.exports = db;