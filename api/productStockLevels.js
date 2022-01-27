const client = require("./client");

const endpoint =
  "https://www.amrod.co.za/v3/api/Catalogue/getProductStockLevels";

const getProductStockLevels = async (itemCode) => {
  let response;
  try {
    response = await client.post(endpoint, { itemCode: itemCode });
  } catch (error) {}
  return response;
};

exports.getProductStockLevels = getProductStockLevels;
