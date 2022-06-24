const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "GGMU21",
    host: "localhost",
    port: 5432,
    database: "navadipticlassroom"
});

pool.connect();

module.exports = pool; 