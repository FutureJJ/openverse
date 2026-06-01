import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import React, { useMemo } from "react";

// Openverse authenticates players with their Solana wallet. We talk to the
// chain through Helius' mainnet RPC. The key is public-read (RPC only); it
// cannot move funds, so shipping it in the client bundle is acceptable for
// now. Override with NEXT_PUBLIC_SOLANA_RPC in production if desired.
export const SOLANA_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC ||
  "https://mainnet.helius-rpc.com/?api-key=50fac5ff-c2ee-477e-8e51-d9c8b12fc6e8";

export const SolanaWalletProvider: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  // network is informational for the adapters; the actual endpoint is Helius.
  const network = WalletAdapterNetwork.Mainnet;

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
    [network]
  );

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
