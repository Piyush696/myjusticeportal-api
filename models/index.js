'use strict';

const Sequelize = require('sequelize');
let config = require(__dirname + '/../config/db-config');

let db = {};
let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL);
}
else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/* Models */

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

/* Mapings */

db.User.belongsToMany(db.Role, { through: 'user_role', foreignKey: 'userId' });
db.Role.belongsToMany(db.User, { through: 'user_role', foreignKey: 'roleId' });

db.Case.belongsTo(db.User, { foreignKey: 'userId', sourceKey: 'userId' });

db.SecurityQuestion.belongsTo(db.Role, { foreignKey: 'roleId', sourceKey: 'roleId' });

db.User.belongsToMany(db.SecurityQuestion, { through: 'user_securityQuestion_Answers', foreignKey: 'userId' });
db.SecurityQuestion.belongsToMany(db.User, { through: 'user_securityQuestion_Answers', foreignKey: 'securityQuestionId' });

db.User.hasMany(db.UserMeta, { foreignKey: 'userId', sourceKey: 'userId' });

db.Files.belongsTo(db.User, { as: 'createdBy' });
db.Case.belongsToMany(db.Files, { as: 'caseFile', through: 'file_case', foreignKey: 'caseId' });
db.Files.belongsToMany(db.Case, { through: 'file_case', foreignKey: 'fileId' });

db.Facility.belongsToMany(db.User, { through: 'user_facility', foreignKey: 'facilityId' })
db.User.belongsToMany(db.Facility, { through: 'user_facility', foreignKey: 'userId' })


module.exports = db;