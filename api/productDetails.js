const client = require("./client");

const endpoint = "https://www.amrod.co.za/v3/api/Catalogue/getProductDetail";

const getProductDetails = async (ProductCode) => {
  let response;
  try {
    response = await client.post(endpoint, { productSimpleCode: ProductCode });
  } catch (error) {
    console.error("Error", error);
  }

  return response;
};

exports.getProductDetails = getProductDetails;
