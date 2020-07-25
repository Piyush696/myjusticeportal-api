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



// Mapping
// db.User.hasMany(db.Address, { foreignKey: 'userId', sourceKey: 'id' });
// db.User.hasMany(db.Property, { foreignKey: 'userId', sourceKey: 'id' });
// db.Property.hasOne(db.Address, { foreignKey: 'propertyId', sourceKey: 'propertyId' });
// db.UserRole.hasMany(db.User, { foreignKey: 'roleId', sourceKey: 'id' });
// db.county.belongsTo(db.State, { foreignKey: 'abreviations', sourceKey: 'abreviations' });
// db.county.hasOne(db.adminConfig, { foreignKey: 'countyId', sourceKey: 'countyId' });


module.exports = db;