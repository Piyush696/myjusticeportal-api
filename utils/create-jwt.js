const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = {
    createJwt: function (userData, rememberMe, callback) {
        console.log(userData);
        let expiresIn = rememberMe ? '15d' : '2h';
        let token = jwt.sign({
            userId: userData.userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            userName: userData.userName,
            isAdmin: userData.isAdmin,
            roles: userData.roles,
            facilities: userData.facilities,
            organizationId: userData.organizationId
        }, config.jwt.secret, { expiresIn: expiresIn, algorithm: config.jwt.algorithm });
        callback(token);
    }
}