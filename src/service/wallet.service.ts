import WalletModel from "../model/wallet.model";

export async function creditEarningsBalance({
  amount,
  user,
}: {
  amount: number;
  user: any;
}) {
  const wallet = await WalletModel.findOne({ user });

  if (!wallet) {
    return { success: false, message: "wallet not found" };
  }

  wallet.earnings += +amount;

  await wallet.save();

  return { success: true, message: "balance added to pending" };
}

export async function creditAffiliateEarnings({
  amount,
  user,
}: {
  amount: number;
  user: string;
}) {
  const wallet = await WalletModel.findOne({ user });

  if (!wallet) {
    return { success: false, message: "wallet not found" };
  }

  wallet.affiliate_earnings += +amount;

  await wallet.save();

  return { success: true, message: "balance added to pending" };
}
