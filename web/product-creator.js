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

export const DEFAULT_PRODUCTS_COUNT = 2;
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
      }
    }
  }
`;

export default async function productCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    for (let i = 0; i < count; i++) {
    fs.createReadStream("./MOCK_DATA1.csv")
      .pipe(
        parse({
          delimiter: ",", 
          columns: true,
          ltrim: true,
        })
      )
      .on("data", function (row) {
        results.push(row);
        // console.log(results[0]);
      })
      .on("end",async function () {
        const adjective = results[Math.floor(Math.random() * results.length)];
        // results.forEach((value, i) => {
          // console.log("data", value.title);
            // if(i < DEFAULT_PRODUCTS_COUNT){
        await  client.query({
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
        // }
        // });
      });

    }
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

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

function randomPrice() {
  return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100;
}
