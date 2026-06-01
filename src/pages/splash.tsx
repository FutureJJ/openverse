import { LoginRelatedController } from "@/client/components/static_site/LoginRelatedController";
import { LoginRelatedControllerContext } from "@/client/components/static_site/LoginRelatedControllerContext";
import { safeDetermineEmployeeUserId } from "@/server/shared/bootstrap/sync";
import Head from "next/head";
import React from "react";

export const getServerSideProps = async () => {
  return {
    props: {
      defaultUsernameOrId: (await safeDetermineEmployeeUserId()) ?? "",
    },
  };
};

// Clean, minimal Openverse landing. The Biomes splash (trailer, masonry feed,
// credits) is gone; this is just a wordmark, one line, and a wallet CTA that
// opens the Solana login modal. The whole flow stays inside
// LoginRelatedController so the existing modal/session plumbing keeps working.
export const SplashPage: React.FunctionComponent<{
  defaultUsernameOrId?: string;
  onLogin?: () => unknown;
}> = ({ defaultUsernameOrId, onLogin }) => {
  return (
    <>
      <Head>
        <title>Openverse — a voxel world you own</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B0817" />
      </Head>
      <LoginRelatedController
        defaultUsernameOrId={defaultUsernameOrId}
        onLogin={onLogin}
      >
        <LoginRelatedControllerContext.Consumer>
          {(loginRelated) => (
            <div className="ov-landing">
              {!loginRelated.showingModal && (
                <div className="ov-landing-inner">
                  <div className="ov-landing-brand">OPENVERSE</div>
                  <p className="ov-landing-tagline">
                    A voxel world you own. Build on-chain.
                  </p>
                  <button
                    className="ov-btn ov-btn-primary ov-landing-cta"
                    onClick={() => loginRelated.showLogin()}
                  >
                    Connect Wallet
                  </button>
                  <div className="ov-landing-footer">Powered by Solana</div>
                </div>
              )}
            </div>
          )}
        </LoginRelatedControllerContext.Consumer>
      </LoginRelatedController>
    </>
  );
};

export default SplashPage;
