import config from '../config.js';
import utils from '../utils.js';
import ComposerRepo from './ComposerRepo.js';

/**
 * @description WPMU DEV Pro plugins, via the WPMU DEV Composer repository.
 * Downloads authenticate with the API key as username and an empty password.
 */
class WpmudevSource {

  constructor(){
    this.repo = new ComposerRepo(config.wpmudev.packagesUrl);
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
    if ( !config.wpmudev.apiKey ) {
      throw new Error('WPMUDEV_API_KEY is required to download WPMU DEV plugins');
    }
    // basic auth is only honored for Composer user agents.
    // bad credentials redirect to the login page instead of returning a 401
    return utils.fetchZip(latest.downloadUrl, {
      headers: {
        Authorization: utils.basicAuth(config.wpmudev.apiKey),
        'User-Agent': 'Composer/2.8.1'
      },
      redirect: 'manual'
    });
  }
}

export default new WpmudevSource();
