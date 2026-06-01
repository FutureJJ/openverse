import { solanaLogin } from "@/client/util/solana_auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import React, { useState } from "react";

// Clean, minimal Openverse sign-in. One job: prove wallet ownership and enter.
// No username here — the game's character creation handles that on first spawn.
export const SolanaLoginPanel: React.FunctionComponent<{
  onCancel?: () => void;
  onSuccess?: () => void;
}> = ({ onCancel, onSuccess }) => {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const connected = wallet.connected && !!wallet.publicKey;
  const address = wallet.publicKey?.toBase58();

  const handleEnter = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await solanaLogin(wallet);
      onSuccess?.();
      window.location.assign("/");
    } catch (e: any) {
      setError(e?.message ?? "Sign-in failed. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="ov-card">
      <div className="ov-brand">OPENVERSE</div>
      <p className="ov-tagline">A voxel world you own.</p>

      {!connected ? (
        <button className="ov-btn ov-btn-primary" onClick={() => setVisible(true)}>
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="ov-wallet-chip">
            {address?.slice(0, 4)}…{address?.slice(-4)}
          </div>
          <button
            className="ov-btn ov-btn-primary"
            disabled={busy}
            onClick={() => void handleEnter()}
          >
            {busy ? "Signing…" : "Enter Openverse"}
          </button>
          <button
            className="ov-btn-text"
            onClick={() => void wallet.disconnect()}
          >
            Disconnect
          </button>
        </>
      )}

      {error && <div className="ov-error">{error}</div>}

      {onCancel && (
        <button className="ov-btn-text" onClick={onCancel}>
          Back
        </button>
      )}
    </div>
  );
};
