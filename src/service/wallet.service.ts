import WalletModel from "../model/wallet.model";

export async function creditEarningsBalance({
  amount,
  user_id,
}: {
  amount: number;
  user_id: any;
}) {
  const wallet = await WalletModel.findOne({ user: user_id });

  if (!wallet) {
    return { success: false, message: "wallet not found" };
  }

  wallet.earnings += amount;

  await wallet.save();

  return { success: true, message: "balance added to pending" };
}
