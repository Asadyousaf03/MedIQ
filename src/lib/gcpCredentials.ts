import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Vertex AI on Render/cloud needs ADC. Prefer a JSON blob in
 * GOOGLE_APPLICATION_CREDENTIALS_JSON so we don't commit key files.
 */
const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.trim();

if (json) {
  const credentialsPath = path.join(os.tmpdir(), 'mediq-gcp-credentials.json');
  fs.writeFileSync(credentialsPath, json, { encoding: 'utf8', mode: 0o600 });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}
