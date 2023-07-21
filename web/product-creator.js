import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";
import { parse } from "csv-parse";
import fs from "fs";
const results = [];

const ADJECTIVES = [
  "autumn",
  "hidden",
  "bitter",
  "misty",
  "silent",
  "empty",
  "dry",
  "dark",
  "summer",
  "icy",
  "delicate",
  "quiet",
  "white",
  "cool",
  "spring",
  "winter",
  "patient",
  "twilight",
  "dawn",
  "crimson",
  "wispy",
  "weathered",
  "blue",
  "billowing",
  "broken",
  "cold",
  "damp",
  "falling",
  "frosty",
  "green",
  "long",
];

const NOUNS = [
  "waterfall",
  "river",
  "breeze",
  "moon",
  "rain",
  "wind",
  "sea",
  "morning",
  "snow",
  "lake",
  "sunset",
  "pine",
  "shadow",
  "leaf",
  "dawn",
  "glitter",
  "forest",
  "hill",
  "cloud",
  "meadow",
  "sun",
  "glade",
  "bird",
  "brook",
  "butterfly",
  "bush",
  "dew",
  "dust",
  "field",
  "fire",
  "flower",
];

export const DEFAULT_PRODUCTS_COUNT = 5;
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        variants(first: 1) {
          nodes {
            id
          }
        }
      }
    }
  }
`;

export default async function productCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });
  const returnproduct=[]

  try {
    for (let i = 0; i < count; i++) {
   
    
     const data = await readCSVFile();
     let adjective = data[Math.floor(Math.random() * data.length)];
      const product = await  client.query({
              data: {
                query: CREATE_PRODUCTS_MUTATION,
                variables: {
                  input: {
                    title: `${adjective.title}`,
                    tags: `${adjective.tags}`,
                    vendor: `${adjective.vendor}`,
                    variants: [
                      {
                        price: adjective.price,
                        compareAtPrice:
                        adjective.price > adjective.compareAtPrice
                            ? adjective.price + 5
                            : adjective.compareAtPrice,
                        imageSrc: `${adjective.image}`,
                        sku: `${adjective.title}`,
                        options: `${adjective.variants}`,
                      },
                    ],
                    images: [{ src: `${adjective.image}`, altText: "Image" }],
                    descriptionHtml: `${adjective.Description}`,
                    productType: `${adjective.productType}`,
                  },
                }, 
              },
            });

console.log("before product",await product.body.data.productCreate.product.variants.nodes[0].id)
returnproduct.push(await product.body.data.productCreate.product.variants.nodes[0].id)
console.log("product === ",returnproduct);

    }
    return returnproduct;

  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}



async function readCSVFile() {
  const data_new = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("./MOCK_DATA1.csv")
      .pipe(
        parse({
          delimiter: ",",
          columns: true,
          ltrim: true,
        })
      )
      .on("data", function (row) {
        data_new.push(row);
      })
      .on("end", function () {
        resolve(data_new);
      })
      .on("error", function (error) {
        reject(error);
      });
  });
}