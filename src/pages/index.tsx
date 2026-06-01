import { RootErrorBoundary } from "@/client/components/RootErrorBoundary";
import SplashPage from "@/pages/splash";
import Head from "next/head";

export interface BiomesHeadTagProps {
  refinedTitle?: string;
  description?: string;
  embedImage?: string;
  cardMode?: "summary" | "summary_large_image";
}

export const BiomesHeadTag: React.FunctionComponent<BiomesHeadTagProps> = (
  props
) => {
  const desc =
    props.description ??
    "Openverse is an open-source voxel MMORPG you own. Connect a Solana wallet and build on-chain, right in your browser.";

  const title = props.refinedTitle
    ? `${props.refinedTitle} | Openverse`
    : "Openverse";

  const cardMode: BiomesHeadTagProps["cardMode"] =
    props.cardMode ?? "summary_large_image";

  return (
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={title} />
      <meta name="og:description" content={desc} />
      <meta name="twitter:card" content={cardMode} />
      <meta name="theme-color" content="#14F195" />
    </Head>
  );
};

export default function Index() {
  return (
    <RootErrorBoundary>
      <BiomesHeadTag />
      <SplashPage
        onLogin={() => {
          window.location.href = "/at";
        }}
      />
    </RootErrorBoundary>
  );
}
