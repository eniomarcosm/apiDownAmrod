const apisauce = require("apisauce");

const client = apisauce.create({
  baseUrl: "https://www.amrod.co.za",
  headers: {
    Authorization: ` Amrod type="integrator", token="7CGrb0ImS13OoEvnqYK/njlawHheUMeST0oBtAWQjiZd/gT8fou63lx/PdppjCunyTVmKA9BafrzxZZQ+i0RKg=="`,
    "Content-Type": "application/json",
    "X-AMROD-IMPERSONATE": "008525",
  },
});

module.exports = client;
