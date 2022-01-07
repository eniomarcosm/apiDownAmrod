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
  var options = { compact: true, ignoreComment: true, spaces: 4 };
  var xml = convert.json2xml(finalJson, options);
  var path = "./temp/amrod.xml";
  fs.writeFileSync(path, xml);
};

// let cont = 0;
const iterateCategory = (categories) => {
  categories.forEach(async (category, index) => {
    if (category.CategoryId) {
      categoryProducts(category);
      console.log(
        "Read category: ",
        // ++cont,
        "Category ID: ",
        category.CategoryId
      );
    }
    if (category.SubCategories) iterateCategory(category.SubCategories);
  });
};

const categoryProducts = async (category) => {
  try {
    const response = await getCategoryProducts(category.CategoryId);
    response.Products.forEach(async (product) => {
      productDetails(product, category);
    });
  } catch (err) {
    console.error(err);
  }
};

const productDetails = async (product, category) => {
  try {
    const details = await getProductDetails(product.ProductId);
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
    return details;
  } catch (error) {
    console.error(error);
  }
  return;
};

const generateAttributes = async () => {
  try {
    const { Categories } = await getCategoryTree();
    iterateCategory(Categories);
  } catch (error) {
    console.error(error);
  }
};

generateAttributes();

const port = "3005";
app.listen(port, () => console.log(`Listining on port ${port}...`));
