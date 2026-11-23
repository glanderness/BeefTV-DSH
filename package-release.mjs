import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const release = join(root, 'release')
const metadata = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const withRuntime = process.argv.includes('--with-runtime')
await mkdir(release, { recursive: true })

const filesToPack = [...metadata.files]
let runtime = null
let executableSHA256 = null
let name = `beeftv-dsh-${metadata.version}.tgz`

if (withRuntime) {
  execFileSync(process.execPath, [join(root, 'package-runtime.mjs')], { cwd: root, stdio: 'inherit' })
  if (!filesToPack.includes('runtime')) filesToPack.push('runtime')
  runtime = JSON.parse(await readFile(join(root, 'runtime', 'version.json'), 'utf8'))
  executableSHA256 = createHash('sha256').update(await readFile(join(root, 'runtime', 'Contents', 'MacOS', 'BeefTV'))).digest('hex')
  name = `beeftv-dsh-${metadata.version}-${runtime.platform || 'darwin-arm64'}.tgz`
}

const target = join(release, name)
execFileSync('tar', ['-czf', target, '--no-mac-metadata', '-s', ',^,package/,S', '--', 'package.json', ...filesToPack], { cwd: root, stdio: 'inherit' })
const entries = execFileSync('tar', ['-tzf', target], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim().split('\n')
const requiredEntries = ['package/host.js', 'package/client.js', 'package/platform-app.js', 'package/runtime-store.js', 'package/runtime-verify.js']
if (requiredEntries.some(entry => !entries.includes(entry))) {
  throw new Error('Required plugin entry files are missing from release archive')
}
if (withRuntime && !entries.includes('package/runtime/Contents/Resources/agent-host/node_modules/@earendil-works/pi-ai/package.json')) {
  throw new Error('Bundled agent dependencies are missing')
}

const sha256 = createHash('sha256').update(await readFile(target)).digest('hex')
const size = (await stat(target)).size
const manifest = {
  plugin: metadata.name,
  version: metadata.version,
  mode: withRuntime ? 'bundled-runtime' : 'lightweight-cross-platform',
  filename: name,
  size,
  sha256,
  fileCount: entries.length,
  ...(runtime ? { runtime, executableSHA256 } : {}),
}
await writeFile(join(release, 'BUILD-MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n')
await writeFile(join(release, 'SHA256SUMS'), `${sha256}  ${name}\n`)
console.log(JSON.stringify(manifest, null, 2))
