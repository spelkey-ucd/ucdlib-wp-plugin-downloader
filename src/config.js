import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

/**
 * @description Application configuration, read from environment variables (and the project .env file)
 */
class Config {
  constructor() {
    this.rootDir = rootDir;

    this.bucket = {
      name: this.getEnv('PLUGINS_BUCKET', 'wordpress-general'),
      prefix: this.getEnv('PLUGINS_BUCKET_PREFIX', 'plugins')
    };

    this.gc = {
      keyFilePath: path.resolve(rootDir, this.getEnv('GOOGLE_APPLICATION_CREDENTIALS', 'secrets/gc-service-account-creds.json')),
      keyFileExists: false
    };
    this.gc.keyFileExists = fs.existsSync(this.gc.keyFilePath);

    this.wpOrg = {
      apiUrl: 'https://api.wordpress.org/plugins/info/1.2/'
    };

    this.acf = {
      packagesUrl: 'https://connect.advancedcustomfields.com/packages.json',
      licenseKey: this.getEnv('ACF_LICENSE_KEY'),
      siteUrl: this.getEnv('ACF_SITE_URL')
    };

    this.wpmudev = {
      packagesUrl: 'https://wpmudev.com/packages.json',
      apiKey: this.getEnv('WPMUDEV_API_KEY')
    };
  }

  /**
   * @description Get an environment variable.  If the variable is not set, return the default value.
   * @param {String} name - The name of the environment variable.
   * @param {*} defaultValue - The default value to return if the environment variable is not set.
   * @param {Boolean} errorIfMissing - If true, throw an error if the environment variable is not set.
   * @returns {*} The value of the environment variable, or the default value
   */
  getEnv(name, defaultValue=false, errorIfMissing=false){
    const env = process?.env?.[name];
    if ( env ) {
      if ( env.toLowerCase() == 'true' ) return true;
      if ( env.toLowerCase() == 'false' ) return false;
      return env;
    }
    if ( errorIfMissing ) {
      throw new Error(`Environment variable ${name} is required`);
    }
    return defaultValue;
  }
}

export default new Config();
