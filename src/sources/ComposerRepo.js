import utils from '../utils.js';

/**
 * @description Reads a Composer repository's packages.json to find plugin versions and download urls.
 * Avoids needing the composer binary - only the zip download itself requires credentials.
 */
export default class ComposerRepo {

  /**
   * @param {String} packagesUrl - Url of the repository's packages.json
   */
  constructor(packagesUrl){
    this.packagesUrl = packagesUrl;
    this._packages = null;
  }

  /**
   * @description Fetch packages.json. Response is cached for the life of the instance,
   * so concurrent lookups share a single request.
   * @returns {Promise<Object>} Map of package name to {version: packageDefinition}
   */
  getPackages(){
    if ( !this._packages ) {
      this._packages = (async () => {
        const res = await fetch(this.packagesUrl);
        if ( !res.ok ) throw new Error(`Failed to fetch ${this.packagesUrl} (${res.status})`);
        const data = await res.json();
        return data.packages || {};
      })();
    }
    return this._packages;
  }

  /**
   * @description Get the latest stable version of a package
   * @param {String} packageName - Composer package name, e.g. 'wpmudev/forminator-pro'
   * @returns {Promise<Object>} {version, downloadUrl}
   */
  async getLatest(packageName){
    const packages = await this.getPackages();
    const pkg = packages[packageName];
    if ( !pkg ) throw new Error(`Package ${packageName} not found in ${this.packagesUrl}`);

    const versions = {};
    for ( const def of Object.values(pkg) ) {
      const version = String(def.version || '').replace(/^v/, '');
      if ( utils.isStableVersion(version) && def.dist?.url ) versions[version] = def.dist.url;
    }
    const version = utils.maxVersion(Object.keys(versions));
    if ( !version ) throw new Error(`No stable versions found for ${packageName}`);

    return { version, downloadUrl: versions[version] };
  }
}
