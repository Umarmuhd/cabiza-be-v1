import braintree from "braintree";
import config from "config";

const merchantId = config.get<string>("braintreeMerchantId");
const publicKey = config.get<string>("braintreePublicKey");
const privateKey = config.get<string>("braintreePrivateKey");

const environment = braintree.Environment.Sandbox;

const gateway = new braintree.BraintreeGateway({
  environment,
  merchantId,
  publicKey,
  privateKey,
});

export default gateway;
