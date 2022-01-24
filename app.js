const express = require("express");
const convert = require("xml-js");
const path = require("path");
const fs = require("fs");

const app = express();

const port = "3000";
app.listen(port, () => console.log(`Listining on port ${port}...`));

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
    console.log("Product added: ", ++cont, "[x]");
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

const categoryProducts = async (category, retries = 5, backoff = 300) => {
  let response;
  try {
    response = await getCategoryProducts(category.CategoryId);
    if (!response) {
      setTimeout(() => {
        console.error(
          retries,
          "Retrying product category: ",
          category.CategoryId
        );
        return categoryProducts(category, retries - 1, backoff * 2);
      }, backoff);
    } else {
      for (const product of response.Products) {
        await productDetails(product, category);
      }
    }
  } catch (err) {
    console.error(err);
  }
  return response;
};

let loaded = 0;
const productDetails = async (
  product,
  category,
  retries = 5,
  backoff = 300
) => {
  let details;
  try {
    details = await getProductDetails(product.ProductId);
    if (!details) {
      setTimeout(() => {
        console.error(
          retries,
          "Retrying product details...",
          product.ProductId
        );
        return productDetails(product, category, retries - 1, backoff * 2);
      }, backoff);
    } else {
      console.log("Product Loaded:", ++loaded, "[ ]");
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
    console.log("Loading categories...");
    const { Categories } = await getCategoryTree();

    await iterateCategory(Categories);
    console.log("Finished");

    // writeXML();
  } catch (error) {
    console.error(error);
  }
};

generateAttributes();
