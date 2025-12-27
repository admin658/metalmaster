import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const apiDir = process.cwd();
const repoRoot = path.resolve(apiDir, '..', '..');
const rootEnvLocalPath = path.resolve(repoRoot, '.env.local');
const apiEnvLocalPath = path.resolve(apiDir, '.env.local');
const apiEnvPath = path.resolve(apiDir, '.env');

const envPath =
  (fs.existsSync(rootEnvLocalPath) && rootEnvLocalPath) ||
  (fs.existsSync(apiEnvLocalPath) && apiEnvLocalPath) ||
  apiEnvPath;

dotenv.config({ path: envPath });
