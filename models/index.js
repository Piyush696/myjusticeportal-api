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

//Models
db.User = require('./user')(sequelize, Sequelize);
db.Role = require('./role')(sequelize, Sequelize);
db.Case = require('./cases')(sequelize, Sequelize);
db.Postage = require('./postageapp')(sequelize, Sequelize);
db.SecurityQuestion = require('./securityQuestion')(sequelize, Sequelize);
db.User_SecurityQuestion_Answers = require('./user_securityQuestion_Answers')(sequelize, Sequelize);

//Mapings
db.User.belongsToMany(db.Role, { through: 'user_role', foreignKey: 'userId' });
db.Role.belongsToMany(db.User, { through: 'user_role', foreignKey: 'roleId' });

db.Case.belongsTo(db.User, { foreignKey: 'userId', sourceKey: 'userId' });

db.SecurityQuestion.belongsTo(db.Role, { foreignKey: 'roleId', sourceKey: 'roleId' });

db.User.belongsToMany(db.SecurityQuestion, { through: 'user_securityQuestion_Answers', foreignKey: 'userId' });
db.SecurityQuestion.belongsToMany(db.User, { through: 'user_securityQuestion_Answers', foreignKey: 'securityQuestionId' });



module.exports = db;