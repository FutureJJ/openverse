// In self-hosted Openverse deployments there is no Google Compute Engine
// metadata service to wait for. The function is kept as a no-op so the
// existing call sites still work; if you ever run on GCE again, set
// WAIT_FOR_GCE=1 to restore the original blocking probe.
export async function waitForAuthReady() {
  if (process.env.WAIT_FOR_GCE !== "1") {
    return;
  }
  const { isAvailable, resetIsAvailableCache } = await import("gcp-metadata");
  const { asyncBackoffOnAllErrorsUntilTruthy } = await import(
    "@/shared/util/retry_helpers"
  );
  const { log } = await import("@/shared/logging");
  log.info("Waiting for GCE metadata service to be available...");
  await asyncBackoffOnAllErrorsUntilTruthy(
    async () => {
      const onGce = await isAvailable();
      if (!onGce) {
        resetIsAvailableCache();
      }
      return onGce;
    },
    { baseMs: 100, maxMs: 5000, exponent: 1.2 }
  );
}
