import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const application = join(process.env.BEEFTV_APP_PATH || '/Applications/BeefTV.app', 'Contents')
const destination = join(root, 'runtime', 'Contents')
if (process.platform !== 'darwin' || process.arch !== 'arm64') throw new Error('This runtime targets macOS Apple Silicon')
const version = execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print CFBundleShortVersionString', join(application, 'Info.plist')], { encoding: 'utf8' }).trim()
// Only application code and resources are copied. Workspace data lives elsewhere.
await rm(join(root, 'runtime'), { recursive: true, force: true })
await mkdir(destination, { recursive: true })
for (const directory of ['MacOS', 'Resources']) {
  await cp(join(application, directory), join(destination, directory), { recursive: true, dereference: true })
}
for (const file of ['LICENSE', 'NOTICE']) await cp(join(root, file), join(root, 'runtime', file))
await writeFile(join(root, 'runtime', 'version.json'), JSON.stringify({ version, platform: 'darwin-arm64' }, null, 2) + '\n')
console.log(`Packaged installed BeefTV ${version} runtime`)
