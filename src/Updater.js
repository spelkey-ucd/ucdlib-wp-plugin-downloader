import allPlugins from './plugins.js';
import bucket from './Bucket.js';
import utils from './utils.js';
import wpOrgSource from './sources/WpOrgSource.js';
import acfSource from './sources/AcfSource.js';
import wpmudevSource from './sources/WpmudevSource.js';

const sources = {
  wporg: wpOrgSource,
  acf: acfSource,
  wpmudev: wpmudevSource
};

/**
 * @description Compares the latest plugin versions in the bucket against upstream,
 * and optionally downloads and uploads new versions.
 */
export default class Updater {

  /**
   * @param {Object} opts - Options
   * @param {Array<String>} opts.plugins - Plugin names to process. Defaults to all plugins.
   * @param {Boolean} opts.upload - If true, download and upload plugins with new versions
   */
  constructor(opts={}){
    this.upload = opts.upload || false;
    this.plugins = Updater.getPlugins(opts.plugins);
  }

  /**
   * @description Look up plugin definitions by name
   * @param {Array<String>} names - Plugin names. If empty, returns all plugins.
   * @returns {Array<Object>} Plugin definitions
   */
  static getPlugins(names=[]){
    if ( !names?.length ) return allPlugins;
    return names.map(name => {
      const plugin = allPlugins.find(p => p.name === name || p.bucketDir === name);
      if ( !plugin ) throw new Error(`Unknown plugin: ${name}. Run the 'list' command to see available plugins.`);
      return plugin;
    });
  }

  /**
   * @description Process all plugins. Errors are captured per plugin so one failure does not stop the run.
   * @returns {Promise<Array<Object>>} Report rows, sorted alphabetically by plugin name
   */
  async run(){
    const rows = await Promise.all(this.plugins.map(plugin => this.processPlugin(plugin)));
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * @description Check a single plugin for updates, and upload the new version if requested
   * @param {Object} plugin - Plugin definition from plugins.js
   * @returns {Promise<Object>} Report row: {name, label, bucketVersion, upstreamVersion, status, newFile, uri, infoUrl, error}
   */
  async processPlugin(plugin){
    const row = {
      name: plugin.name,
      label: plugin.label,
      bucketVersion: null,
      upstreamVersion: null,
      status: null,
      newFile: null,
      uri: null,
      infoUrl: plugin.infoUrl || null,
      error: null
    };

    try {
      const source = sources[plugin.source];
      // settle both so the report still shows whichever lookup succeeded
      const [bucketResult, latestResult] = await Promise.allSettled([
        bucket.getLatestVersion(plugin),
        source.getLatest(plugin)
      ]);
      if ( latestResult.status === 'fulfilled' ) {
        row.upstreamVersion = latestResult.value.version;
        row.infoUrl = latestResult.value.infoUrl;
      }
      if ( bucketResult.status === 'fulfilled' ) row.bucketVersion = bucketResult.value;
      if ( latestResult.status === 'rejected' ) throw latestResult.reason;
      if ( bucketResult.status === 'rejected' ) throw bucketResult.reason;

      const bucketVersion = bucketResult.value;
      const latest = latestResult.value;

      if ( bucketVersion && utils.compareVersions(latest.version, bucketVersion) <= 0 ) {
        row.status = 'current';
        return row;
      }

      row.newFile = bucket.getFileName(plugin, latest.version);
      if ( !this.upload ) {
        row.status = 'update available';
        return row;
      }

      const buffer = await source.download(plugin, latest);
      row.uri = await bucket.upload(plugin, latest.version, buffer);
      row.status = 'uploaded';
    } catch (e) {
      row.status = 'error';
      row.error = e.message;
    }
    return row;
  }
}
