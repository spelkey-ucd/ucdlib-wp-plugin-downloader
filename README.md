# ucdlib-wp-plugin-downloader

CLI that checks for updates to the third-party WordPress plugins our sites use, uploads new versions to the plugins bucket (`gs://wordpress-general/plugins`), and reports what changed. Updating the Dockerfile ARGs is still a manual step.

| Source | Plugins | Auth |
| ------ | ------- | ---- |
| wordpress.org plugin API | Broken Link Checker, Gallery Block Lightbox, Redirection, SMTP Mailer, User Role Editor, Editoria11y, OpenID Connect Generic | none |
| ACF Composer repo | ACF Pro | `ACF_LICENSE_KEY` + `ACF_SITE_URL` |
| WPMU DEV Composer repo | Defender Pro, Forminator Pro, Hummingbird Pro, Smush Pro, WPMU DEV Dashboard | `WPMUDEV_API_KEY` |

Plugins are defined in `src/plugins.js`.

## Setup

```bash
npm install
./devops/cmds/get-env.sh      # .env from secret manager (wp-plugin-downloader-env)
./devops/cmds/get-gc-key.sh   # service account key -> secrets/gc-service-account-creds.json
```

If the key file is missing, application default credentials are used (`gcloud auth application-default login`).

### Environment variables

| Name | Description |
| ---- | ----------- |
| `WPMUDEV_API_KEY` | WPMU DEV API key (Hub -> API key) |
| `ACF_LICENSE_KEY` | ACF Pro license key |
| `ACF_SITE_URL` | A site url **already activated** on the ACF license, including `https://`. A new url will use up an activation. |
| `PLUGINS_BUCKET` | Default `wordpress-general` |
| `PLUGINS_BUCKET_PREFIX` | Default `plugins` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Default `secrets/gc-service-account-creds.json` |

## Usage

```bash
npx wp-plugins list                         # managed plugins
npx wp-plugins check                        # read-only: bucket vs upstream
npx wp-plugins update                       # download + upload all new versions
npx wp-plugins update forminator-pro smush-pro
npx wp-plugins check --json
```

The bucket version is determined by parsing filenames (`<prefix>-<version>.zip`). Uploads never overwrite an existing object. After an update, copy the new filenames from the report into the Dockerfile ARGs for each site.
