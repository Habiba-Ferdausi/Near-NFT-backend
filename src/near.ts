import { providers } from "near-api-js";

const DEFAULT_RPC = process.env.NEAR_RPC_URL || "https://rpc.testnet.near.org";

export const provider = new providers.JsonRpcProvider({ url: DEFAULT_RPC });

export async function walletExists(accountId: string): Promise<boolean> {
  try {
    await provider.query({
      request_type: "view_account",
      account_id: accountId,
      finality: "final",
    });
    return true;
  } catch {
    return false;
  }
}

function encodeArgs(args: object) {
  return Buffer.from(JSON.stringify(args)).toString("base64");
}

export async function viewFunction<T = any>(
  contractId: string,
  methodName: string,
  args: object
): Promise<T> {
  const res: any = await provider.query({
    request_type: "call_function",
    account_id: contractId,
    method_name: methodName,
    args_base64: encodeArgs(args),
    finality: "final",
  });
  const result = Buffer.from(res.result).toString();
  return JSON.parse(result) as T;
}
