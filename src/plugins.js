/**
 * @description Plugins managed by this tool.
 * @property {String} name - Short identifier used on the command line
 * @property {String} label - Human-readable name
 * @property {String} bucketDir - Directory in the plugins bucket where zips are stored
 * @property {String} filePrefix - Zip filename prefix. Files are named <filePrefix>-<version>.zip
 * @property {String} source - Where to get the plugin: 'wporg', 'acf', or 'wpmudev'
 * @property {String} slug - wordpress.org plugin slug (wporg source only)
 * @property {String} package - Composer package name (acf and wpmudev sources only)
 * @property {String} infoUrl - Page with plugin details/changelog (composer sources only; wporg is derived from slug)
 */
const plugins = [
  {
    name: 'acf-pro',
    label: 'ACF Pro',
    bucketDir: 'advanced-custom-fields-pro',
    filePrefix: 'advanced-custom-fields-pro',
    source: 'acf',
    package: 'wpengine/advanced-custom-fields-pro',
    infoUrl: 'https://www.advancedcustomfields.com/changelog/'
  },
  {
    name: 'broken-link-checker',
    label: 'Broken Link Checker',
    bucketDir: 'broken-link-checker',
    filePrefix: 'broken-link-checker',
    source: 'wporg',
    slug: 'broken-link-checker'
  },
  {
    name: 'defender-pro',
    label: 'Defender Pro',
    bucketDir: 'defender-pro',
    filePrefix: 'defender-pro',
    source: 'wpmudev',
    package: 'wpmudev/wp-defender',
    infoUrl: 'https://wpmudev.com/project/wp-defender/'
  },
  {
    name: 'forminator-pro',
    label: 'Forminator Pro',
    bucketDir: 'forminator-pro',
    filePrefix: 'forminator-pro',
    source: 'wpmudev',
    package: 'wpmudev/forminator-pro',
    infoUrl: 'https://wpmudev.com/project/forminator-pro/'
  },
  {
    name: 'hummingbird-pro',
    label: 'Hummingbird Pro',
    bucketDir: 'hummingbird-pro',
    filePrefix: 'hummingbird-pro',
    source: 'wpmudev',
    package: 'wpmudev/wp-hummingbird',
    infoUrl: 'https://wpmudev.com/project/wp-hummingbird/'
  },
  {
    name: 'gallery-block-lightbox',
    label: 'Gallery Block Lightbox',
    bucketDir: 'gallery-block-lightbox',
    filePrefix: 'gallery-block-lightbox',
    source: 'wporg',
    slug: 'gallery-block-lightbox'
  },
  {
    name: 'redirection',
    label: 'Redirection',
    bucketDir: 'redirection',
    filePrefix: 'redirection',
    source: 'wporg',
    slug: 'redirection'
  },
  {
    name: 'smtp-mailer',
    label: 'SMTP Mailer',
    bucketDir: 'smtp-mailer',
    filePrefix: 'smtp-mailer',
    source: 'wporg',
    slug: 'smtp-mailer'
  },
  {
    name: 'smush-pro',
    label: 'Smush Pro',
    bucketDir: 'smush-pro',
    filePrefix: 'smush-pro',
    source: 'wpmudev',
    package: 'wpmudev/wp-smush-pro',
    infoUrl: 'https://wpmudev.com/project/wp-smush-pro/'
  },
  {
    name: 'user-role-editor',
    label: 'User Role Editor',
    bucketDir: 'user-role-editor',
    filePrefix: 'user-role-editor',
    source: 'wporg',
    slug: 'user-role-editor'
  },
  {
    name: 'wpmudev-dashboard',
    label: 'WPMU DEV Dashboard',
    bucketDir: 'wpmudev-updates',
    filePrefix: 'wpmu-dev-dashboard',
    source: 'wpmudev',
    package: 'wpmudev/wpmu-dev-dashboard',
    infoUrl: 'https://wpmudev.com/project/wpmu-dev-dashboard/'
  },
  {
    name: 'editoria11y',
    label: 'Editoria11y',
    bucketDir: 'editoria11y-accessibility-checker',
    filePrefix: 'editoria11y-accessibility-checker',
    source: 'wporg',
    slug: 'editoria11y-accessibility-checker'
  },
  {
    name: 'openid-connect-generic',
    label: 'OpenID Connect Generic Client',
    bucketDir: 'openid-connect-generic',
    filePrefix: 'daggerhart-openid-connect-generic',
    source: 'wporg',
    slug: 'daggerhart-openid-connect-generic'
  }
];

export default plugins;
