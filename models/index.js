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

//Mapings
db.User.belongsToMany(db.Role, { through: 'user_role', foreignKey: 'userId' });
db.Role.belongsToMany(db.User, { through: 'user_role', foreignKey: 'roleId' });



module.exports = db;