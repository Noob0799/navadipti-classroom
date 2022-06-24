const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtgenerator = (payload) => {
    return jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: "1hr"});
};

module.exports = jwtgenerator;