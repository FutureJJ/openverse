import { solanaSignInMessage } from "@/pages/api/auth/solana/nonce";
import { ensurePlayerExists } from "@/server/logic/utils/players";
import {
  connectForeignAuth,
  findLinkForForeignAuth,
} from "@/server/shared/auth/auth_link";
import { setAuthCookies } from "@/server/shared/auth/cookies";
import { getSecret } from "@/server/shared/secrets";
import { getUserOrCreateIfNotExists } from "@/server/web/db/users";
import { findByUID } from "@/server/web/db/users_fetch";
import { okOrAPIError } from "@/server/web/errors";
import {
  DoNotSendResponse,
  biomesApiHandler,
  zDoNotSendResponse,
} from "@/server/web/util/api_middleware";
import { APIError } from "@/shared/api/errors";
import { log } from "@/shared/logging";
import bs58 from "bs58";
import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import { z } from "zod";

export const zSolanaVerifyRequest = z.object({
  publicKey: z.string(),
  // base58-encoded detached ed25519 signature of the /nonce message.
  signature: z.string(),
  // The opaque challenge token returned by /nonce.
  token: z.string(),
  // Optional display name chosen during registration.
  username: z.string().trim().min(1).max(24).optional(),
});
export type SolanaVerifyRequest = z.infer<typeof zSolanaVerifyRequest>;

function defaultUsernameFor(publicKey: string): string {
  return `Player_${publicKey.slice(0, 4)}${publicKey.slice(-4)}`;
}

export default biomesApiHandler(
  {
    auth: "optional",
    body: zSolanaVerifyRequest,
    response: zDoNotSendResponse,
  },
  async ({
    context,
    body: { publicKey, signature, token, username },
    unsafeResponse,
  }) => {
    const { db, idGenerator, sessionStore } = context;

    // 1. Validate the signed challenge (stateless; no server storage).
    let decoded: { publicKey?: string; nonce?: string; purpose?: string };
    try {
      decoded = jwt.verify(token, getSecret("foreign-auth-state")) as any;
    } catch (error) {
      throw new APIError("unauthorized", "Challenge expired. Please try again.");
    }
    okOrAPIError(
      decoded.purpose === "solana-auth" && decoded.publicKey === publicKey,
      "unauthorized",
      "Challenge does not match wallet."
    );

    // 2. Verify the wallet actually signed the challenge message (ed25519).
    let signatureValid = false;
    try {
      signatureValid = nacl.sign.detached.verify(
        new TextEncoder().encode(solanaSignInMessage(publicKey, decoded.nonce!)),
        bs58.decode(signature),
        bs58.decode(publicKey)
      );
    } catch (error) {
      log.warn("Solana signature decode failed", { error });
    }
    okOrAPIError(signatureValid, "unauthorized", "Invalid wallet signature.");

    // 3. Find the user linked to this wallet, or create one.
    let link = await findLinkForForeignAuth(db, "solana", publicKey);
    if (!link) {
      const userId = await idGenerator.next();
      link = await connectForeignAuth(
        db,
        "solana",
        { id: publicKey, username } as any,
        userId
      );
    }

    let user = await findByUID(db, link.userId, true);
    if (!user) {
      user = await getUserOrCreateIfNotExists(
        db,
        link.userId,
        username || defaultUsernameFor(publicKey),
        ""
      );
      const editor = context.worldApi.edit();
      await ensurePlayerExists(editor, user.id, user.username ?? "player");
      await editor.commit();
      log.info(`Created Solana-linked user ${user.id} for wallet ${publicKey}`);
    }
    okOrAPIError(!user.disabled, "unauthorized", "This account is disabled.");

    // 4. Issue the session cookie — the player is now logged in.
    const session = await sessionStore.createSession(link.userId);
    setAuthCookies(unsafeResponse, session);
    return DoNotSendResponse;
  }
);
