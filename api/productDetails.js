const client = require("./client");

const endpoint = "https://www.amrod.co.za/v3/api/Catalogue/getProductDetail";

const getProductDetails = async (productId) => {
  let response;
  try {
    response = await client.post(endpoint, { productId: productId });
  } catch (error) {
    console.error("Error", error);
  }

  return response;
};

exports.getProductDetails = getProductDetails;
