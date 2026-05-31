import admin from "firebase-admin";

// Self-hosted Openverse no longer requires Firebase Admin for its primary
// data path (sessions, users, world state are all on Redis). The Admin SDK
// is still instantiated lazily here purely so any remaining FCM push call
// sites keep type-checking. Provide FIREBASE_PROJECT_ID +
// FIREBASE_SERVICE_ACCOUNT (JSON key as env var) if you want push
// notifications; otherwise initialization stays inert.
export function getFirebaseAdminApp(): admin.app.App {
  if (!(global as any).firebaseAdminApp) {
    if (admin.apps.length === 0) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      const opts: admin.AppOptions = {};
      if (projectId) {
        opts.projectId = projectId;
      }
      if (serviceAccountJson) {
        try {
          opts.credential = admin.credential.cert(
            JSON.parse(serviceAccountJson)
          );
        } catch (err) {
          // Fall through to default credential (no-op when unset).
        }
      }
      (global as any).firebaseAdminApp = admin.initializeApp(opts);
    } else {
      (global as any).firebaseAdminApp = admin.apps[0];
    }
  }
  return (global as any).firebaseAdminApp as admin.app.App;
}
