import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";
import { parse } from "csv-parse";
import fs from "fs";
const results = [];


export const DEFAULT_PRODUCTS_COUNT = 2;
const CREATE_PRODUCTS_MUTATION = `
mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
      }
    }
  }
`;

export default async function orderCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    // for (let i = 0; i < count; i++) {
    // fs.createReadStream("./MOCK_DATA1.csv")
    //   .pipe(
    //     parse({
    //       delimiter: ",", 
    //       columns: true,
    //       ltrim: true,
    //     })
    //   )
    //   .on("data", function (row) {
    //     results.push(row);
    //     // console.log(results[0]);
    //   })
    //   .on("end",async function () {
    //     const adjective = results[Math.floor(Math.random() * results.length)];
        // results.forEach((value, i) => {
          // console.log("data", value.title);
            // if(i < DEFAULT_PRODUCTS_COUNT){

        await  client.query({
            data: {
              query: CREATE_PRODUCTS_MUTATION,
              variables: {
                input: {
                  "customerId": "gid://shopify/Customer/7076175053090",
        "note": "Test draft order",
        "email": "test.user@shopify.com",
        "taxExempt": true,
        "tags": [
          "foo",
          "bar"
        ],
        "shippingLine": {
          "title": "Custom Shipping",
          "price": 4.55
        },
        "shippingAddress": {
          "address1": "123 Main St",
          "city": "Waterloo",
          "province": "Ontario",
          "country": "Canada",
          "zip": "A1A 1A1"
        },
        "billingAddress": {
          "address1": "456 Main St",
          "city": "Toronto",
          "province": "Ontario",
          "country": "Canada",
          "zip": "Z9Z 9Z9"
        },
        "appliedDiscount": {
          "description": "damaged",
          "value": 5.0,
          "amount": 5.0,
          "valueType": "FIXED_AMOUNT",
          "title": "Custom"
        },
        "lineItems": [
          {
            "variantId": "gid://shopify/ProductVariant/45356068176162",
            "quantity": 2
          }
        ],
        "customAttributes": [
          {
            "key": "name",
            "value": "Achilles"
          },
          {
            "key": "city",
            "value": "Troy"
          }
        ]
                },
              },
            },
          });
        // }
        // });
    //   });

    // }
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
  