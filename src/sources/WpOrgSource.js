import config from '../config.js';
import utils from '../utils.js';

/**
 * @description Plugins from the wordpress.org plugin directory
 */
class WpOrgSource {

  /**
   * @description Get the latest version of a plugin from the wordpress.org plugin info api
   * @param {Object} plugin - Plugin definition from plugins.js
   * @returns {Promise<Object>} {version, downloadUrl, infoUrl}
   */
  async getLatest(plugin){
    const url = new URL(config.wpOrg.apiUrl);
    url.searchParams.set('action', 'plugin_information');
    url.searchParams.set('request[slug]', plugin.slug);
    url.searchParams.set('request[fields][sections]', '0');
    url.searchParams.set('request[fields][versions]', '0');

    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if ( !res.ok || data.error ) {
      throw new Error(`wordpress.org lookup for ${plugin.slug} failed (${res.status}): ${data.error || 'unknown error'}`);
    }

    // always use download_link - some plugins serve their latest release from an unversioned url
    return {
      version: data.version,
      downloadUrl: data.download_link,
      infoUrl: `https://wordpress.org/plugins/${plugin.slug}/`
    };
  }

  /**
   * @description Download the plugin zip
   * @param {Object} plugin - Plugin definition from plugins.js
   * @param {Object} latest - Result of getLatest
   * @returns {Promise<Buffer>}
   */
  async download(plugin, latest){
    return utils.fetchZip(latest.downloadUrl);
  }
}

export default new WpOrgSource();
