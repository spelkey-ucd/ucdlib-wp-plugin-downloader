import { Storage } from '@google-cloud/storage';
import config from './config.js';
import utils from './utils.js';

/**
 * @description Reads and writes plugin zips in the Google Cloud Storage plugins bucket.
 * Zips are stored at <prefix>/<bucketDir>/<filePrefix>-<version>.zip
 */
class Bucket {

  constructor(){
    this._storage = null;
  }

  /**
   * @description Storage client. Uses the service account key file if present, otherwise application default credentials.
   * @returns {Storage}
   */
  get storage(){
    if ( !this._storage ) {
      const opts = config.gc.keyFileExists ? { keyFilename: config.gc.keyFilePath } : {};
      this._storage = new Storage(opts);
    }
    return this._storage;
  }

  /**
   * @description Get the object path for a plugin version
   * @param {Object} plugin - Plugin definition from plugins.js
   * @param {String} version - Plugin version
   * @returns {String}
   */
  getObjectPath(plugin, version){
    return `${config.bucket.prefix}/${plugin.bucketDir}/${this.getFileName(plugin, version)}`;
  }

  /**
   * @description Get the zip filename for a plugin version, e.g. 'smtp-mailer-1.1.28.zip'
   * @param {Object} plugin - Plugin definition from plugins.js
   * @param {String} version - Plugin version
   * @returns {String}
   */
  getFileName(plugin, version){
    return `${plugin.filePrefix}-${version}.zip`;
  }

  /**
   * @description Get the latest version of a plugin stored in the bucket, based on filenames
   * @param {Object} plugin - Plugin definition from plugins.js
   * @returns {Promise<String|null>} Latest version, or null if no matching files
   */
  async getLatestVersion(plugin){
    const prefix = `${config.bucket.prefix}/${plugin.bucketDir}/`;
    const [files] = await this.storage.bucket(config.bucket.name).getFiles({ prefix });
    const versions = files
      .map(f => utils.parseVersionFromFileName(f.name.slice(prefix.length), plugin.filePrefix))
      .filter(v => v);
    return utils.maxVersion(versions);
  }

  /**
   * @description Upload a plugin zip. Will not overwrite an existing object.
   * @param {Object} plugin - Plugin definition from plugins.js
   * @param {String} version - Plugin version
   * @param {Buffer} buffer - Zip contents
   * @returns {Promise<String>} gs:// uri of the uploaded object
   */
  async upload(plugin, version, buffer){
    const objectPath = this.getObjectPath(plugin, version);
    await this.storage.bucket(config.bucket.name).file(objectPath).save(buffer, {
      contentType: 'application/zip',
      resumable: false,
      preconditionOpts: { ifGenerationMatch: 0 }
    });
    return `gs://${config.bucket.name}/${objectPath}`;
  }
}

export default new Bucket();
