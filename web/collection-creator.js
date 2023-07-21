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

        const collectiondata = await readCSVFile()

        const collection = collectiondata[Math.floor(Math.random() * collectiondata.length)];


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


async function readCSVFile() {
  const data_new = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("./collection.csv")
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
        console.log("resolve",data_new[0]);
        resolve(data_new);
      })
      .on("error", function (error) {
        console.log("reject");
        reject(error);
      });
  });
}


