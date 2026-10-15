import config from '../config.js';
import utils from '../utils.js';
import ComposerRepo from './ComposerRepo.js';

/**
 * @description ACF Pro, via the ACF Composer repository.
 * Downloads authenticate with the license key as username and an already-activated site url as password.
 */
class AcfSource {

  constructor(){
    this.repo = new ComposerRepo(config.acf.packagesUrl);
  }

  /**
   * @description Get the latest version of the plugin
   * @param {Object} plugin - Plugin definition from plugins.js
   * @returns {Promise<Object>} {version, downloadUrl, infoUrl}
   */
  async getLatest(plugin){
    const latest = await this.repo.getLatest(plugin.package);
    return { ...latest, infoUrl: plugin.infoUrl };
  }

  /**
   * @description Download the plugin zip
   * @param {Object} plugin - Plugin definition from plugins.js
   * @param {Object} latest - Result of getLatest
   * @returns {Promise<Buffer>}
   */
  async download(plugin, latest){
    if ( !config.acf.licenseKey || !config.acf.siteUrl ) {
      throw new Error('ACF_LICENSE_KEY and ACF_SITE_URL are required to download ACF Pro');
    }
    return utils.fetchZip(latest.downloadUrl, {
      headers: { Authorization: utils.basicAuth(config.acf.licenseKey, config.acf.siteUrl) }
    });
  }
}

export default new AcfSource();
