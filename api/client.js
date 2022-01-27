require("dotenv/config");
const apisauce = require("apisauce");

const client = apisauce.create({
  headers: {
    Authorization: process.env.AUTHORIZATTION,
    "X-AMROD-IMPERSONATE": process.env.IMPERSONATE,
    "Content-Type": "application/json",
  },
});

module.exports = client;
