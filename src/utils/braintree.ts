import braintree from "braintree";

const merchantId = process.env.BRAIN_TREE_MERCHANT_ID;
const publicKey = process.env.BRAIN_TREE_PUBLIC_KEY;
const privateKey = process.env.BRAIN_TREE_PRIVATE_KEY;
const environment = braintree.Environment.Sandbox;

console.log(merchantId, privateKey, environment, publicKey);

const gateway = new braintree.BraintreeGateway({
  environment,
  //@ts-ignore
  merchantId,
  //@ts-ignore
  publicKey,
  //@ts-ignore
  privateKey,
});

export default gateway;
