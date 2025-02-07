"use strict";
// import pkg from 'pg';
// const { Pool } = pkg;
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: "localhost",
    user: "postgres",
    port: 5433,
    database: "e_commerce",
    password: "admin",
});
pool.connect().then(() => {
    console.log("Connected to Database..");
});
exports.default = pool;
