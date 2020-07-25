"use strict";

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'local';

let config = {};

// config.production = {
//     db: {
//         username: "psd9b0132vjutep7",
//         password: "k9eh3503dczhld8n",
//         database: "iklhw1x61zp2t61g",
//         host: "tviw6wn55xwxejwj.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
//         dialect: "mysql",
//         migrationStorage: "json",
//         define: {
//             charset: 'utf8',
//             collate: 'utf8_general_ci',
//             timestamps: true
//         }
//     },
//     jwt: {
//         secret: '1TJ!$v:BcQ^/Qy7|j9T8]+(B{~/Uyuh%fNiEPoj4{;VE{}(9~Y#31E?]u:MN;ai',
//         algorithm: 'HS512'
//     },
// };

// config.development = {
//     db: {
//         username: "psd9b0132vjutep7",
//         password: "k9eh3503dczhld8n",
//         database: "iklhw1x61zp2t61g",
//         host: "tviw6wn55xwxejwj.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
//         dialect: "mysql",
//         migrationStorage: "json",
//         define: {
//             charset: 'utf8',
//             collate: 'utf8_general_ci',
//             timestamps: true
//         }
//     },
//     jwt: {
//         secret: '1TJ!$v:BcQ^/Qy7|j9T8]+(B{~/Uyuh%fNiEPoj4{;VE{}(9~Y#31E?]u:MN;ai',
//         algorithm: 'HS512'
//     },
// };

config.local = {
    db: {
        username: "root",
        password: "",
        database: "myjustice-portal",
        host: "localhost",
        dialect: "mysql",
        migrationStorage: "json",
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: true
        }
    },
    jwt: {
        secret: '1TJ!$v:BcQ^/Qy7|j9T8]+(B{~/Uyuh%fNiEPoj4{;VE{}(9~Y#31E?]u:MN;ai',
        algorithm: 'HS512'
    },
};

console.log("Environment --> ", env);

module.exports = config[env];