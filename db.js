const Pool = require("pg").Pool;
require("dotenv").config();

const devConfig = {
  user: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE_NAME,
};

const productionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
};

const pool = new Pool(
  process.env.NODE_ENV === "production" ? productionConfig : devConfig
);

// pg.Pool emits 'error' whenever a pooled connection drops unexpectedly
// (Neon's serverless compute auto-suspends and recycles idle connections
// routinely). Without a listener here, that event is unhandled and Node
// kills the whole process on the next dropped connection.
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

module.exports = pool;
