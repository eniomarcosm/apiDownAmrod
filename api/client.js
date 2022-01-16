require("dotenv/config");
const apisauce = require("apisauce");

const client = apisauce.create({
  baseUrl: "https://www.amrod.co.za",

  headers: {
    Authorization: process.env.AUTHORIZATTION,
    "X-AMROD-IMPERSONATE": process.env.IMPERSONATE,
    "Content-Type": "application/json",
  },
});
console.log(client.headers);

module.exports = client;
