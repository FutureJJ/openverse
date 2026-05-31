import { log } from "@/shared/logging";
import { predictableId } from "@/shared/util/auto_id";
import { ok } from "assert";
import { keys } from "lodash";

function Secret<T>() {
  return null as unknown as T;
}

const ALL_SECRETS = {
  "biomes-discord-bot-token": Secret<string>(),
  "biomesbob-client-secret": Secret<string>(),
  "biomesbob-private-key": Secret<string>(),
  "discord-biomes-alpha-webhook": Secret<string>(),
  "discord-camera-webhook-url": Secret<string>(),
  "discord-deploy-webhook-url": Secret<string>(),
  "discord-new-users-webhook-url": Secret<string>(),
  "discord-oauth-client-secret": Secret<string>(),
  "discord-review-webhook-url": Secret<string>(),
  "discord-social-webhook-url": Secret<string>(),
  "discord-test-webhook-url": Secret<string>(),
  "discord-user-report-webhook-url": Secret<string>(),
  "elevenlabs-api-key": Secret<string>(),
  "foreign-auth-state": Secret<string>(),
  "game-action-permission-token-secret": Secret<string>(),
  "github-mossy-mucker-personal-access-token": Secret<string>(),
  "google-oauth-client-secret": Secret<string>(),
  "ill-alchemy-api-key": Secret<string>(),
  "internal-auth-token": Secret<string>(),
  "linear-api-key": Secret<string>(),
  "openai-api-key": Secret<string>(),
  "postmark-auth-transactional": Secret<string>(),
  "splash-recaptcha-server-secret": Secret<string>(),
  "twitter-oauth-client-secret": Secret<string>(),
  "twitch-oauth-client-secret": Secret<string>(),
  "untrusted-apply-token": Secret<string>(),
} as const;

export type SecretKey = keyof typeof ALL_SECRETS;
type SecretVal<T extends SecretKey> = (typeof ALL_SECRETS)[T];
type SecretMap = { [K in SecretKey]: SecretVal<K> };

export class Secrets {
  private readonly secretMap: SecretMap;

  constructor(secretMap: SecretMap) {
    this.secretMap = secretMap;
  }

  get<T extends SecretKey>(secret: T): SecretVal<T> {
    return this.secretMap[secret] as SecretVal<T>;
  }
}

// Convert "biomes-discord-bot-token" → "BIOMES_DISCORD_BOT_TOKEN"
function secretToEnvKey(secretName: string): string {
  return secretName.toUpperCase().replace(/-/g, "_");
}

// Critical secrets: if missing in production the server should refuse to
// start, because using a random value here would silently invalidate every
// existing session/token. Everything else falls back to a random dev value
// when not configured (external API features just disable themselves).
const CRITICAL_SECRETS: SecretKey[] = [
  "internal-auth-token",
  "foreign-auth-state",
  "game-action-permission-token-secret",
  "untrusted-apply-token",
];

function loadSecretsFromEnv(strict: boolean): Secrets {
  const fallback = createRandomSecretMap("env-fallback");
  const missing: string[] = [];
  const missingCritical: string[] = [];

  for (const name of keys(ALL_SECRETS) as SecretKey[]) {
    const envKey = secretToEnvKey(name);
    const value = process.env[envKey];
    if (value !== undefined && value !== "") {
      (fallback as any)[name] = value;
    } else {
      missing.push(envKey);
      if (CRITICAL_SECRETS.includes(name)) {
        missingCritical.push(envKey);
      }
    }
  }

  if (strict && missingCritical.length > 0) {
    throw new Error(
      `Production startup blocked: missing critical secret env vars: ` +
        `${missingCritical.join(", ")}. Generate values with ` +
        `\`openssl rand -hex 32\` and set them in your environment.`
    );
  }

  if (missing.length > 0) {
    log.warn(
      `Optional secrets not set (random fallback used, related features may degrade): ${missing.join(
        ", "
      )}`
    );
  }

  return new Secrets(fallback);
}

export async function bootstrapGlobalSecrets(
  ..._additionalSecretsNeeded: SecretKey[]
) {
  if ((global as any)._global_secrets) {
    return; // already set
  }
  const strict = process.env.NODE_ENV === "production";
  (global as any)._global_secrets = loadSecretsFromEnv(strict);
}

export function getGlobalSecrets() {
  const secrets = (global as any)._global_secrets as Secrets;
  ok(secrets);
  return secrets;
}

export function getSecret<T extends SecretKey>(t: T) {
  return getGlobalSecrets().get(t);
}

// We use this index so that even with a common seed the generated
// secrets differ.
let randomSecretIndex = 1;

function createRandomSymmetricKey(_seed?: string) {
  // TODO: Generate a seed-derived random symmetric key.
  return "ivOB9+jNVDek9emP4G/xCGD12trNefpGek/+9vurIYg=";
}

function createRandomKey(seed?: string, targetLength?: number) {
  return predictableId(`${seed}${randomSecretIndex++}`, targetLength);
}

function createRandomUrl(seed?: string) {
  return `http://localhost/#${createRandomKey(seed)}`;
}

function createRandomSecretMap(seed?: string): SecretMap {
  return {
    "biomes-discord-bot-token": createRandomKey(seed),
    "biomesbob-client-secret": createRandomKey(seed),
    "biomesbob-private-key": createRandomSymmetricKey(seed),
    "discord-biomes-alpha-webhook": createRandomUrl(seed),
    "discord-camera-webhook-url": createRandomUrl(seed),
    "discord-deploy-webhook-url": createRandomUrl(seed),
    "discord-new-users-webhook-url": createRandomUrl(seed),
    "discord-oauth-client-secret": createRandomKey(seed),
    "discord-review-webhook-url": createRandomUrl(seed),
    "discord-social-webhook-url": createRandomUrl(seed),
    "discord-test-webhook-url": createRandomUrl(seed),
    "discord-user-report-webhook-url": createRandomUrl(seed),
    "elevenlabs-api-key": "",
    "foreign-auth-state": createRandomKey(seed),
    "game-action-permission-token-secret": createRandomKey(seed),
    "github-mossy-mucker-personal-access-token": createRandomSymmetricKey(seed),
    "google-oauth-client-secret": createRandomKey(seed),
    "ill-alchemy-api-key": createRandomKey(seed),
    "internal-auth-token": createRandomKey(seed),
    "linear-api-key": createRandomKey(seed),
    "openai-api-key": "",
    "postmark-auth-transactional": createRandomKey(seed),
    "splash-recaptcha-server-secret": createRandomKey(seed),
    "twitter-oauth-client-secret": createRandomKey(seed),
    "twitch-oauth-client-secret": createRandomKey(seed),
    "untrusted-apply-token": createRandomKey(seed),
  };
}

export function createRandomSecrets(seed?: string): Secrets {
  return new Secrets(createRandomSecretMap(seed));
}
