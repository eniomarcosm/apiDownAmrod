const apisauce = require("apisauce");
const dotenv = require("dotenv");
dotenv.config();

const client = apisauce.create({
  baseUrl: "https://www.amrod.co.za",
  headers: {
    Authorization: process.env.AUTHORIZATION,
    "Content-Type": "application/json",
    "X-AMROD-IMPERSONATE": process.env.IMPERSONATE,
  },
});

module.exports = client;
