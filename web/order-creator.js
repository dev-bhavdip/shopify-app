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
const COMPLETE_ORDER = `mutation draftOrderComplete($id: ID!) {
  draftOrderComplete(id: $id) {
    draftOrder {
      id
      order {
        id
      }
    }
  }
}`;

export default async function orderCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT,
  customer,
  product
) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    let value = await customer[Math.floor(Math.random() * customer.length)];
    let productvalue = await product[
      Math.floor(Math.random() * product.length)
    ];

    console.log("customer", value);
    console.log("product", productvalue);
    const order = await client.query({
      data: {
        query: CREATE_PRODUCTS_MUTATION,
        variables: {
          input: {
            customerId: `${await value.id}`,
            note: "Test draft order",
            email: "test.user@shopify.com",
            taxExempt: true,
            tags: ["foo", "bar"],
            shippingLine: {
              title: "Custom Shipping",
              price: 4.55,
            },
            shippingAddress: {
              address1: "123 Main St",
              city: "Waterloo",
              province: "Ontario",
              country: "Canada",
              zip: "A1A 1A1",
            },
            billingAddress: {
              address1: "456 Main St",
              city: "Toronto",
              province: "Ontario",
              country: "Canada",
              zip: "Z9Z 9Z9",
            },
            appliedDiscount: {
              description: "damaged",
              value: 5.0,
              amount: 5.0,
              valueType: "FIXED_AMOUNT",
              title: "Custom",
            },
            lineItems: [
              {
                variantId: `${await productvalue}`,
                quantity: 2,
              },
              // "gid://shopify/ProductVariant/45356068176162"
            ],
            customAttributes: [
              {
                key: "name",
                value: "Achilles",
              },
              {
                key: "city",
                value: "Troy",
              },
            ],
          },
        },
      },
    });
    console.log(
      "order id",
      await order.body.data.draftOrderCreate.draftOrder.id
    );

    const complete = await client.query({
      data: {
        query: COMPLETE_ORDER,
        variables: {
          id: `${await order.body.data.draftOrderCreate.draftOrder.id}`,
        },
      },
    });
    console.log("complete order");
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
