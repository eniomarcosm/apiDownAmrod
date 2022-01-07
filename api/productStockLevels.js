const client = require("./client");

const endpoint =
  "https://www.amrod.co.za/v3/api/Catalogue/getProductStockLevels";

const getProductStockLevels = async (itemCode) => {
  let response;
  try {
    response = await client.post(endpoint, { itemCode: itemCode });
    return response.data.Body;
  } catch (error) {}
  return;
};

exports.getProductStockLevels = getProductStockLevels;
