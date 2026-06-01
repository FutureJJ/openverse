import { fetchSocialMetadata, fetchTileMetadata } from "@/server/web/db/map";
import { biomesApiHandler } from "@/server/web/util/api_middleware";
import { zWorldMapMetadataResponse } from "@/shared/types";

export default biomesApiHandler(
  {
    auth: "optional",
    response: zWorldMapMetadataResponse,
  },
  async ({ context: { db } }) => {
    const [tileMetadata, socialMetadata] = await Promise.all([
      fetchTileMetadata(db),
      fetchSocialMetadata(db),
    ]);

    // When the map service hasn't generated tile metadata yet (self-hosted
    // instances without a running map server), return an empty-but-valid
    // metadata payload instead of a 404. This keeps the client from spamming
    // failed requests and lets loading complete; the world map just renders
    // empty until tiles are generated.
    if (!tileMetadata) {
      return {
        id: "empty",
        version: "0",
        fullImageURL: "",
        fullImageWidth: 0,
        fullImageHeight: 0,
        fullTileImageURL: "",
        boundsStart: [0, 0] as [number, number],
        boundsEnd: [0, 0] as [number, number],
        socialData: socialMetadata,
        tileImageTemplateURL: "",
        tileMaxZoomLevel: 0,
        tileMinZoomLevel: 0,
        tileSize: 256,
        versionIndex: {},
      };
    }

    return {
      ...tileMetadata,
      socialData: socialMetadata,
    };
  }
);
