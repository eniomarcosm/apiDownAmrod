const express = require("express");
const convert = require("xml-js");
const path = require("path");
const fs = require("fs");

const app = express();

const port = "3002";
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

let errorProduct = {
  ProductId: [],
  CategoryId: [],
};

let cont = 0;
const generateJson = (data) => {
  try {
    finalJson.DocumentElement.Product.push(data);
    console.log("Product number: ", ++cont, "added[x]");
    writeXML();
  } catch (err) {
    console.error(err);
  }
};

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

const writeErrorJson = () => {
  try {
    var path = "./temp/errors.json";
    fs.writeFileSync(path, JSON.stringify(errorProduct));
  } catch (error) {
    console.error(error);
  }
};

const categoryProducts = async (categoryId) => {
  let response;
  try {
    response = await getCategoryProducts(categoryId);
    if (!response.ok) {
      errorProduct.CategoryId.push(categoryId);
      writeErrorJson();
      return;
    }
  } catch (err) {
    console.error(err);
  }
  return response.data.Body.Products;
};

const productDetails = async (productId) => {
  let response;
  try {
    response = await getProductDetails(productId);
    if (!response.ok) {
      errorProduct.ProductId.push(productId);
      writeErrorJson();
      return;
    }
  } catch (error) {
    console.error(error);
  }
  return response.data.Body;
};

let categoryTreeFlat = [];
const flatCategory = async (categories) => {
  for (const category of categories) {
    if (category.SubCategories.length) flatCategory(category.SubCategories);
    else {
      categoryTreeFlat.push(category);
      writeErrorJson();
    }
  }
};

const generateProducts = async () => {
  for (const category of categoryTreeFlat) {
    const products = await categoryProducts(category.CategoryId);
    if (Array.isArray(products) && products.length) {
      for (const product of products) {
        const details = await productDetails(product.ProductId);
        generateJson({
          CategoryInfo: category,
          ProductInfo: product,
          ProductDetails: details,
        });
      }
    }
  }
};

async function main() {
  try {
    console.log("Loading category tree...");
    const response = await getCategoryTree();
    console.log("Categories loaded successfully!");

    flatCategory(response.data.Body.Categories);
    console.log("Caterories Tree in Flat...");

    console.log("Generating Products...");
    generateProducts();
  } catch (error) {
    console.log(error);
  }
}

main();
