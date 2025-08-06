export type CheckWalletRequest = { walletId: string };

export type NormalizedNFT = {
  token_id: string;
  title?: string;
  description?: string;
  media?: string;
  contractId: string;
};

export type CheckWalletResponse =
  | { exists: false; nfts: NormalizedNFT[] }
  | { exists: true; nfts: NormalizedNFT[] };
