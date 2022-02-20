import ProductModel, { Product } from "../model/product.model";

export async function createProduct(input: Partial<Product>) {
  return ProductModel.create(input);
}
