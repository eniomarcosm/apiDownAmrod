const client = require("./client");

const endpoint = "https://www.amrod.co.za/v3/api/Catalogue/getCategoryTree";

const getCategoryTree = async () => {
  let response;
  try {
    response = await client.post(endpoint);
    return response.data.Body;
  } catch (error) {
    console.error(error);
  }
  return;
};

exports.getCategoryTree = getCategoryTree;
