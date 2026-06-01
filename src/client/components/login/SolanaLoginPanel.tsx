import { solanaLogin } from "@/client/util/solana_auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React, { useState } from "react";

// LIQUID SOLANA login panel: a glassmorphism card with the Solana brand
// gradient. Connect a wallet, pick a name, sign the challenge, enter the world.
export const SolanaLoginPanel: React.FunctionComponent<{
  onCancel?: () => void;
  onSuccess?: () => void;
}> = ({ onCancel, onSuccess }) => {
  const wallet = useWallet();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const connected = wallet.connected && !!wallet.publicKey;
  const address = wallet.publicKey?.toBase58();

  const handleEnter = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await solanaLogin(wallet, username.trim() || undefined);
      onSuccess?.();
      // Cookie is set; reload into the authenticated app.
      window.location.assign("/");
    } catch (e: any) {
      setError(e?.message ?? "Sign-in failed. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="relative w-[min(92vw,30rem)] overflow-hidden rounded-3xl p-[1.5px]">
      {/* Gradient border */}
      <div className="absolute inset-0 bg-gradient-to-br from-solana-purple via-solana-green to-solana-purple opacity-80" />
      {/* Glass card */}
      <div className="relative flex flex-col items-center gap-6 rounded-3xl bg-solana-ink/85 px-8 py-10 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-3xl font-black tracking-[0.2em] text-transparent">
            OPENVERSE
          </div>
          <p className="text-center text-sm text-white/60">
            A voxel world you own. Build on-chain.
          </p>
        </div>

        {!connected ? (
          <div className="flex w-full flex-col items-center gap-3">
            {/* wallet-adapter modal trigger, themed via global css below */}
            <WalletMultiButton className="ov-wallet-button" />
            <p className="text-center text-xs text-white/40">
              Phantom · Solflare · sign a message, no gas
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-xs text-solana-green">
              {address?.slice(0, 4)}…{address?.slice(-4)} connected
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wider text-white/50">
                Choose your name
              </label>
              <input
                autoFocus
                value={username}
                maxLength={24}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !busy) void handleEnter();
                }}
                placeholder="e.g. voxelpilot"
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-solana-green"
              />
            </div>
            <button
              disabled={busy}
              onClick={() => void handleEnter()}
              className="rounded-xl bg-gradient-to-r from-solana-purple to-solana-green px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Signing…" : "Enter Openverse"}
            </button>
            <button
              onClick={() => void wallet.disconnect()}
              className="text-xs text-white/40 hover:text-white/70"
            >
              Disconnect wallet
            </button>
          </div>
        )}

        {error && (
          <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-xs text-red-300">
            {error}
          </div>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-white/40 hover:text-white/70"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
};
