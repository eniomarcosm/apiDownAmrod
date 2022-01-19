const express = require("express");
const convert = require("xml-js");
const fs = require("fs");

const app = express();

const {
  getCategoryTree,
  getProductDetails,
  getCategoryProducts,
  getProductStockLevels,
} = require("./api");

let finalJson = {
  DocumentElement: {
    Product: [],
  },
};

let cont = 0;
const generateJson = (data) => {
  try {
    finalJson.DocumentElement.Product.push(data);
    writeXML();
    console.log("Added product number: ", ++cont);
  } catch (err) {
    console.error(err);
  }
};

// const addToJson = (data) => {
//   finalJson.DocumentElement.Product.push(data);
//   console.log(finalJson);
//   writeXML();
// };

const writeXML = () => {
  try {
    var options = { compact: true, ignoreComment: true, spaces: 4 };
    var xml = convert.json2xml(finalJson, options);
    var path = "./temp/amrod.xml";
    fs.writeFileSync(path, xml);
  } catch (error) {
    console.error(error);
  }
};

const iterateCategory = async (categories) => {
  for (const category of categories) {
    if (category.CategoryId) {
      await categoryProducts(category);
    }
    if (category.SubCategories) iterateCategory(category.SubCategories);
  }
};

const categoryProducts = async (category) => {
  let response;
  try {
    response = await getCategoryProducts(category.CategoryId);
    for (const product of response.Products) {
      await productDetails(product, category);
    }
  } catch (err) {
    console.error(err);
  }
  return response;
};

const productDetails = async (product, category) => {
  let details;
  try {
    details = await getProductDetails(product.ProductId);
    if (details) {
      generateJson({
        CategoryName: category.CategoryName,
        CategortImage: category.CategoryImageUrl3x,
        ProductDetails: details,
      });
    }
  } catch (error) {
    console.error(error);
  }
  return details;
};

const generateAttributes = async () => {
  try {
    const { Categories } = await getCategoryTree();

    await iterateCategory(Categories);
    // writeXML();
  } catch (error) {
    console.error(error);
  }
};

generateAttributes();

const port = "3002";
app.listen(port, () => console.log(`Listining on port ${port}...`));
