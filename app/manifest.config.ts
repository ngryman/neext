import startCase from 'lodash-es/startCase'
import { loadEnv } from 'vite'
import type { ManifestFn } from 'zenext/vite'
import { version } from './package.json'

export const manifest: ManifestFn = ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const name = getExtensionName(mode)
  const iconPrefix = mode !== 'production' ? `icon-${mode.replace('development', 'dev')}` : 'icon'
  const externalWebsites = getExternalWebsites(env.VITE_WWW_URL)

  return {
    name,
    version,
    description: 'Automate data extraction in your browser. No code, no limits, no headaches.',
    manifest_version: 3,
    minimum_chrome_version: '114',
    icons: {
      '16': `icons/${iconPrefix}@16.png`,
      '32': `icons/${iconPrefix}@32.png`,
      '48': `icons/${iconPrefix}@48.png`,
      '128': `icons/${iconPrefix}@128.png`,
    },
    action: {
      default_title: 'Click to open Get Sheet Done',
      default_icon: {
        '16': `icons/${iconPrefix}@16.png`,
        '32': `icons/${iconPrefix}@32.png`,
        '48': `icons/${iconPrefix}@48.png`,
        '128': `icons/${iconPrefix}@128.png`,
      },
    },
    commands: {
      'dialog:open': {
        suggested_key: {
          default: 'Alt+G',
        },
        description: 'Open Get Sheet Done dialog',
      },
    },
    background: {
      service_worker: 'src/apps/background/index.ts',
    },
    side_panel: {
      default_path: 'src/apps/panel/index.html',
    },
    externally_connectable: {
      matches: externalWebsites,
    },
    permissions: ['cookies', 'downloads', 'sidePanel', 'scripting', 'storage', 'unlimitedStorage'],
    // optional_permissions: ['alarms'],
    host_permissions: ['<all_urls>'],
  }
}

function getExtensionName(mode: string): string {
  return mode === 'production'
    ? 'Get Sheet Done (Early Access)'
    : `Get Sheet Done (${startCase(mode)})`
}

function getExternalWebsites(url: string): string[] {
  return [`${url}/*`]
}
