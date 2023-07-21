import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";
import { parse } from "csv-parse";
import fs from "fs";
const results = [];



export const DEFAULT_PRODUCTS_COUNT = 2;
const CREATE_PRODUCTS_MUTATION = `
mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      userErrors {
        field
        message
      }
      collection {   
        id
        title
        descriptionHtml
        handle
        sortOrder
        ruleSet {
          appliedDisjunctively
          rules {
            column
            relation
            condition
          }
        }
      }
    }
  }
`;

export default async function collectionCreate(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    for (let i = 0; i < count; i++) {

    fs.createReadStream("./collection.csv")   
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
      .on("end", function () {

        const collection = results[Math.floor(Math.random() * results.length)];

        // results.forEach((value, i) => {
        //   console.log("data", value.title,"valu of i",i);
                // if( i < DEFAULT_PRODUCTS_COUNT){
          client.query({
            data: {
              query: CREATE_PRODUCTS_MUTATION,
              variables: {
                input: { 
                    title: `${collection.title}`,
                    descriptionHtml: `${collection.collection_desc}`,
                    ruleSet: {
                      appliedDisjunctively: false,
                      rules: [ {  
                        column: `${collection.column}`,
                        relation: `${collection.relation}`,
                        condition: `${collection.condition}`       
                      } ] 
                    },
                    image: {src:`${collection.images}`}
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
