import { getSecret } from "@/server/shared/secrets";
import { biomesApiHandler } from "@/server/web/util/api_middleware";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const zSolanaNonceRequest = z.object({
  publicKey: z.string(),
});
export type SolanaNonceRequest = z.infer<typeof zSolanaNonceRequest>;

export const zSolanaNonceResponse = z.object({
  // Opaque signed challenge token; client returns it verbatim to /verify.
  token: z.string(),
  // The exact message the wallet must sign.
  message: z.string(),
});
export type SolanaNonceResponse = z.infer<typeof zSolanaNonceResponse>;

export function solanaSignInMessage(publicKey: string, nonce: string): string {
  return [
    "Sign in to Openverse",
    "",
    "Approve this signature to prove you own this wallet.",
    "This request will not trigger any transaction or cost any fees.",
    "",
    `Wallet: ${publicKey}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}

export default biomesApiHandler(
  {
    auth: "optional",
    body: zSolanaNonceRequest,
    response: zSolanaNonceResponse,
  },
  async ({ body: { publicKey } }) => {
    const nonce = randomBytes(16).toString("hex");
    // Sign the (publicKey, nonce) pair so /verify can trust it without any
    // server-side session storage. Short-lived to limit replay.
    const token = jwt.sign(
      { publicKey, nonce, purpose: "solana-auth" },
      getSecret("foreign-auth-state"),
      { expiresIn: "5m" }
    );
    return {
      token,
      message: solanaSignInMessage(publicKey, nonce),
    };
  }
);
