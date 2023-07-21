import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";
import { parse } from "csv-parse";
import fs from "fs";
const results = [];

export const DEFAULT_PRODUCTS_COUNT = 10;
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
async function readCSVFile() {
  const data_new = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream("./customers1.csv")
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
        console.log("resolve", data_new[0]);
        resolve(data_new);
      })
      .on("error", function (error) {
        console.log("reject");
        reject(error);
      });
  });
}

async function data() {
  const data = await readCSVFile();
  let value = await data[Math.floor(Math.random() * data.length)];
  return value;
}

export default async function customerCreate(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });
  let returnCustomer = [];
  try {

    for (let i = 0; i < count; i++) {
      console.log("hello", i);
      let zip = Math.random().toString(36).toUpperCase().replace(/[0-9O]/g, "").substring(1, 4);
      let zip1 = Math.random().toString(36).toUpperCase().replace(/[0-9O]/g, "").substring(1, 4);
      let value = await data();
      let fzip=zip + zip1;
      console.log("zip",fzip);

      console.log("read value", value);
      const customer = await client.query({
        data: {
          query: CREATE_PRODUCTS_MUTATION,
          variables: {
            input: {
              email: `${value.email}`,
              phone: `${value.phone}`,
              firstName: `${value.first_name}`,
              lastName: `${value.last_name}`,
              acceptsMarketing: true,
              addresses: [
                {
                  address1: `${value.address1}`,
                  city: `${value.city}`,
                  phone: `${value.phone}`,
                  zip: `${fzip}`,
                  lastName: `${value.last_name}`,
                  firstName: `${value.first_name}`,
                  country: `${value.country}`,
                },
              ],
            },
          },
        },
      });
      console.log("before customer", customer.body);
      returnCustomer.push(await customer.body.data.customerCreate.customer);
      console.log("after cutomer", returnCustomer);
    }
    const returnCustomer1 = returnCustomer.filter((item) => {
      return item !== null;
    });
    console.log("outer array ", returnCustomer1);
    return returnCustomer1;

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
