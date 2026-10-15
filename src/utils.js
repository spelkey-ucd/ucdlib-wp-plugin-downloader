/**
 * @description Shared helper functions
 */
class Utils {

  constructor(){
    this.versionPattern = /^\d+(?:\.\d+)*$/;
  }

  /**
   * @description Compare two dot-separated numeric version strings (e.g. '2.4.14.1' vs '2.4.15').
   * Missing segments are treated as 0, so '1.2' equals '1.2.0'.
   * @param {String} a - First version
   * @param {String} b - Second version
   * @returns {Number} Positive if a > b, negative if a < b, 0 if equal
   */
  compareVersions(a, b){
    const aParts = String(a).split('.').map(Number);
    const bParts = String(b).split('.').map(Number);
    const len = Math.max(aParts.length, bParts.length);
    for ( let i = 0; i < len; i++ ) {
      const diff = (aParts[i] || 0) - (bParts[i] || 0);
      if ( diff !== 0 ) return diff;
    }
    return 0;
  }

  /**
   * @description Check if a string is a stable numeric version (no 'dev-', '-beta', etc)
   * @param {String} version - Version string
   * @returns {Boolean}
   */
  isStableVersion(version){
    return this.versionPattern.test(String(version));
  }

  /**
   * @description Return the highest version from a list of version strings
   * @param {Array<String>} versions - List of versions
   * @returns {String|null} Highest version, or null if list is empty
   */
  maxVersion(versions){
    if ( !versions.length ) return null;
    return [...versions].sort((a, b) => this.compareVersions(b, a))[0];
  }

  /**
   * @description Extract the version from a plugin zip filename, e.g. 'smtp-mailer-1.1.28.zip' -> '1.1.28'
   * @param {String} fileName - Zip filename (without directory)
   * @param {String} filePrefix - Expected filename prefix, e.g. 'smtp-mailer'
   * @returns {String|null} Version, or null if filename does not match the expected pattern
   */
  parseVersionFromFileName(fileName, filePrefix){
    if ( !fileName.startsWith(`${filePrefix}-`) || !fileName.endsWith('.zip') ) return null;
    const version = fileName.slice(filePrefix.length + 1, -4);
    return this.isStableVersion(version) ? version : null;
  }

  /**
   * @description Download a zip file into memory, verifying the response is actually a zip
   * @param {String} url - Download url
   * @param {Object} opts - Options
   * @param {Object} opts.headers - Request headers
   * @param {String} opts.redirect - fetch redirect mode. Use 'manual' for endpoints that redirect to a login page on bad auth
   * @returns {Promise<Buffer>}
   */
  async fetchZip(url, opts={}){
    const res = await fetch(url, { headers: opts.headers || {}, redirect: opts.redirect || 'follow' });
    if ( res.status >= 300 && res.status < 400 ) {
      throw new Error(`Download redirected (${res.status}) to ${res.headers.get('location')} - credentials are probably invalid`);
    }
    if ( !res.ok ) {
      const body = await res.text();
      throw new Error(`Download failed (${res.status}): ${body.slice(0, 200)}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if ( !this.isZip(buffer) ) {
      throw new Error(`Downloaded file from ${url} is not a zip (content-type: ${res.headers.get('content-type')})`);
    }
    return buffer;
  }

  /**
   * @description Check for the zip file signature ('PK\x03\x04')
   * @param {Buffer} buffer - File contents
   * @returns {Boolean}
   */
  isZip(buffer){
    return buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  }

  /**
   * @description Build an HTTP basic auth header value
   * @param {String} username - Username
   * @param {String} password - Password
   * @returns {String}
   */
  basicAuth(username, password=''){
    return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  }
}

export default new Utils();
