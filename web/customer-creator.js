import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";
import { parse } from "csv-parse";
import fs from "fs";
const results = [];

export const DEFAULT_PRODUCTS_COUNT = 2;
const CREATE_PRODUCTS_MUTATION = `
mutation customerCreate($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer {
      id
      email
      phone 
      taxExempt
      acceptsMarketing
      firstName
      lastName
      addresses {
        address1
        city
        country
        phone
        zip
      }
    }
  }
}
`;

export default async function customerCreate(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    console.log("customer");
    for (let i = 0; i < count; i++) {

   fs.createReadStream("./customers1.csv")
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
      .on("end",  function () {
        let value = results[Math.floor(Math.random() * results.length)];
console.log("customer",value);
        // let zip =Math.random().toString(36).toUpperCase().replace(/[0-9O]/g, '').substring(1,4)      
        // let zip1 =Math.random().toString(36).toUpperCase().replace(/[0-9O]/g, '').substring(1,4)      

        //   console.log("data", value,"random",zip,"==",zip1);

   client.query({
      data: {
        query: CREATE_PRODUCTS_MUTATION,
        variables: {   
          input: {
            "email": `${value.email}`,
            "phone": `${value.phone}`,
            "firstName": `${value.first_name}`,
            "lastName": `${value.last_name}`,
            "acceptsMarketing": true,
            "addresses": [
              {
                "address1": `${value.address1}`,
                "city": `${value.city}`,
                "phone": `${value.phone}`,
                "zip": 'AA4 4AA', 
                "lastName": `${value.last_name}`,
                "firstName": `${value.first_name}`,
                "country": `${value.country}`
              }
            ]
          },
        },
      },
    });   
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
