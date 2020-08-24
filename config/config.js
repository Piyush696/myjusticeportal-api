"use strict";

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'local';

let config = {};

config.production = {
    db: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        dialect: "mysql",
        migrationStorage: "json",
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: true
        }
    },
    jwt: {
        secret: process.env.SECRET_KEY,
        algorithm: 'HS512'
    },
};


config.development = {
    db: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOSTNAME,
        dialect: "mysql",
        migrationStorage: "json",
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: true
        }

    },
    jwt: {
        secret: process.env.SECRET_KEY,
        algorithm: 'HS512'
    },
};

config.local = {
    db: {
        username: "root",
        password: "",
        database: "rxt7scbg23giysn8",
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

module.exports = config[env];