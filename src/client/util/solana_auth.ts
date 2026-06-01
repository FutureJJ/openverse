import { jsonPost } from "@/shared/util/fetch_helpers";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import bs58 from "bs58";

interface NonceResponse {
  token: string;
  message: string;
}

/**
 * Authenticate a player with their Solana wallet:
 *   1. Ask the server for a signed challenge message.
 *   2. Have the wallet sign it (proves ownership, no transaction).
 *   3. Send the signature back; the server verifies it, finds-or-creates the
 *      user, and sets the session cookie.
 *
 * `username` is only used the first time a wallet logs in (registration).
 */
export async function solanaLogin(
  wallet: WalletContextState,
  username?: string
): Promise<void> {
  if (!wallet.publicKey) {
    throw new Error("Connect a wallet first.");
  }
  if (!wallet.signMessage) {
    throw new Error("This wallet does not support message signing.");
  }
  const publicKey = wallet.publicKey.toBase58();

  const { token, message } = await jsonPost<NonceResponse, { publicKey: string }>(
    "/api/auth/solana/nonce",
    { publicKey }
  );

  const signatureBytes = await wallet.signMessage(
    new TextEncoder().encode(message)
  );
  const signature = bs58.encode(signatureBytes);

  await jsonPost("/api/auth/solana/verify", {
    publicKey,
    signature,
    token,
    username,
  });
}
