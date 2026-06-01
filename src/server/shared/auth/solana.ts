import type { ForeignAuthProvider } from "@/server/shared/auth/types";

// Solana wallet authentication does NOT use the OAuth-style redirect flow that
// the other providers (discord/google/...) use. Wallets sign a challenge
// message client-side, so auth is handled by the dedicated endpoints:
//   POST /api/auth/solana/nonce   -> issue a signed challenge
//   POST /api/auth/solana/verify  -> verify the signature, create/find user
//
// This class only exists so that "solana" is a valid ForeignAuthProviderName,
// which lets the verify endpoint reuse the standard auth-link storage
// (connectForeignAuth / findLinkForForeignAuth) keyed as "foreign:solana:<addr>".
export class SolanaProvider implements ForeignAuthProvider<any> {
  async start(): Promise<void> {
    throw new Error(
      "Solana auth is handled by /api/auth/solana/{nonce,verify}, not the redirect flow."
    );
  }

  async finish(): Promise<any> {
    throw new Error(
      "Solana auth is handled by /api/auth/solana/{nonce,verify}, not the redirect flow."
    );
  }
}
