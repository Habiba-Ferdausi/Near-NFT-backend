import "dotenv/config";
import express from "express";
import cors from "cors";
import { walletExists, viewFunction } from "./near";
import type { CheckWalletRequest, CheckWalletResponse, NormalizedNFT } from "./types";

const app = express();
app.use(cors());
app.use(express.json());

const CONTRACTS_IN_ORDER = [
  "dev-1675486904766-77262865372547",
  "sharddoggies.testnet",
  "bdnftminttest.testnet",
];

function normalizeToken(token: any, contractId: string): NormalizedNFT {
  const meta = token.metadata ?? token;
  return {
    token_id: token.token_id ?? token.tokenId ?? "",
    title: meta.title,
    description: meta.description,
    media: meta.media,
    contractId,
  };
}


// post route

app.post("/check-wallet", async (req, res) => {
  const body = req.body as CheckWalletRequest;

  if (!body?.walletId || typeof body.walletId !== "string") {
    return res.status(400).json({ error: "walletId is required" });
  }

  const walletId = body.walletId.trim();

  //check wallet existence

  const exists = await walletExists(walletId);
  if (!exists) {
    const payload: CheckWalletResponse = { exists: false, nfts: [] };
    return res.json(payload);
  }

  //fetch NFTs 
  
  const all: NormalizedNFT[] = [];

  for (const contractId of CONTRACTS_IN_ORDER) {
    try {
      const tokens = await viewFunction<any[]>(
        contractId,
        "nft_tokens_for_owner",
        { account_id: walletId, from_index: "0", limit: 50 }
      );
      if (Array.isArray(tokens)) {
        for (const t of tokens) {
          all.push(normalizeToken(t, contractId));
        }
      }
    } catch (e) {
      console.error(`Error querying ${contractId}`, e);
    }
  }

  const payload: CheckWalletResponse = { exists: true, nfts: all };
  return res.json(payload);
});


app.get("/", (req, res) => {
  res.send("Welcome to NEAR NFT API");
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
