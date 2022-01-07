const client = require("./client");

const endpoint = "https://www.amrod.co.za/v3/api/Catalogue/getCategoryProducts";

const getCategoryProducts = async (categoryId) => {
  let response;
  try {
    response = await client.post(endpoint, {
      categoryId: categoryId,
    });
    return response.data.Body;
  } catch (error) {
    console.error(error);
  }
  return;
};

exports.getCategoryProducts = getCategoryProducts;
