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

const generateJson = (data) => {
  try {
    finalJson.DocumentElement.Product.push(data);
    console.log(finalJson);
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

let cont = 0;
const iterateCategory = async (categories) => {
  for (const category of categories) {
    // categories.forEach(async (category) => {
    if (category.CategoryId) {
      await categoryProducts(category);
      // console.log(
      //   "Read category: ",
      //   ++cont,
      //   "Category ID: ",
      //   category.CategoryId
      // );
    }
    if (category.SubCategories) iterateCategory(category.SubCategories);
  }
};

const categoryProducts = async (category) => {
  let response;
  try {
    response = await getCategoryProducts(category.CategoryId);
    for (const product of response.Products) {
      // response.Products.forEach(async (product) => {
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
        ItemCode: product.ProductCode,
        Name: product.ProductName,
        Description: details.ProductDescription,
        Price: product.Price,
        Flags: 0,
        SimpleCode: product.ProductCode,
        ProductId: product.ProductId,
        IsSet: "null",
        Colour: details.PromotionStyle,
        IsComponentSet: false,
        Behavior: details.Behavior,
        InStock: true,
        Image: product.ImageUrlXL,
        Cateories: category.CategoryName,
        Status: "publish",
        VariationEnabled: "yes",
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
    writeXML();
    console.log("!!!!!!!!SUCESS!!!!!");
  } catch (error) {
    console.error(error);
  }
};

generateAttributes();

const port = "3005";
app.listen(port, () => console.log(`Listining on port ${port}...`));
