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
  ProductCode: [],
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

const productDetails = async (ProductCode) => {
  let response;
  try {
    response = await getProductDetails(ProductCode);
    if (!response.ok) {
      errorProduct.ProductCode.push(ProductCode);
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
    categoryTreeFlat.push(category);
    if (category.SubCategories.length) flatCategory(category.SubCategories);
    else {
      // categoryTreeFlat.push(category);
      writeErrorJson();
    }
  }
};

const generateProducts = async () => {
  let firstCategory = "";
  for (const category of categoryTreeFlat) {
    const products = await categoryProducts(category.CategoryId);
    if (products.length === 0) {
      firstCategory = category.CategoryName;
    }
    if (Array.isArray(products) && products.length) {
      for (const product of products) {
        const details = await productDetails(product.ProductCode);
        // generateJson({
        //   CategoryInfo: category,
        //   ProductInfo: product,
        //   ProductDetails: details,
        // });

        const getImageLink = (colourCode, imageType) => {
          const Images = details.Images;
          for (const image of Images) {
            if (
              image.VariantColourCode === colourCode &&
              image.ImageType === imageType
            ) {
              return image.ImageUrl3x;
            }
          }
        };

        const StockLevel = details.StockLevel.Levels;

        for (const stock of StockLevel) {
          const data = {
            SimpleCode: details.ProductCode,
            ItemCode: stock.ItemCode,
            Category: firstCategory,
            SubCategory: category.CategoryName,
            StockCheckCode: stock.ItemCode,
            Description: details.ProductDescription,
            Name: details.ProductName,
            Price: details.Price,
            ProductId: details.ProductId,
            Size: stock.SizeCode,
            Colour: stock.ColourCode,
            Promotion: details.Promotion,
            Gender: details.Gender,
            GenderMatch: details.GenderOtherCode,
            Behavior: details.Behavior,
            InStock: stock.InStock,
            ColourName: stock.ColourName,
            Reserved: stock.Reserved,
            IsWorkewear: details.IsWorkewear,
            IsEssetial: details.IsEssetial,
            ImageCategory: product.ImageUrl3x,
            // ImageDefault: `https://productcatalogue2020.s3.amazonaws.com/${stock.ItemCode}-${stock.ColourCode}-MOFR01_460_350.jpg`,
            ImageColorAditional: getImageLink(stock.ColourCode, "additional"),
            ImageColorDefault: getImageLink(stock.ColourCode, "defaultvariant"),

            // Flags: product.Flags,
            // IsSet: product.IsSet,
            // IsComponentSet: product.IsComponentSet,
            // Decoupled: product.Decoupled,
            // IsComponent: product.IsComponent,
          };

          generateJson(data);
        }
        // for (const stock in details.StockLevel) {
        //   console.log(stock.Levels);
        // }
        // console.log({
        //   ItemCode: product.ProductCode,
        //   Name: product.ProductName,
        //   Description: product.ProductDescription,
        //   Price: product.Price,
        //   Flags: product.Flags,
        //   SimpleCode: product.SimpleCode,
        //   ProductId: product.ProductId,
        //   Size: product.Size,
        //   Colour: product.Colour,
        //   Promotion: product.Promotion,
        //   IsSet: product.IsSet,
        //   IsComponentSet: product.IsComponentSet,
        //   Behavior: product.Behavior,
        //   InStock: product.InStock,
        //   IsEssetial: product.IsEssetial,
        //   Decoupled: product.Decoupled,
        //   ColourName: product.ColourName,
        //   StockCheckCode: product.StockCheckCode,
        //   IsComponent: product.IsComponent,
        //   IsWorkewear: product.IsWorkewear,

        //   // Usefull for the future
        //   CategoryInfo: category,
        //   ProductInfo: product,
        //   ProductDetails: details,
        // });
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
    console.log("Categories Tree in Flat...");

    console.log("Generating Products...");
    generateProducts();
  } catch (error) {
    console.log(error);
  }
}

main();
