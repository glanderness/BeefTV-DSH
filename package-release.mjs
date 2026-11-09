import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const release = join(root, 'release')
const metadata = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
await mkdir(release, { recursive: true })
execFileSync(process.execPath, [join(root, 'package-runtime.mjs')], { cwd: root, stdio: 'inherit' })
const name = `beeftv-dsh-${metadata.version}-darwin-arm64.tgz`
const target = join(release, name)
// Preserve the runtime's nested node_modules and executable modes. npm pack
// would omit nested dependencies from the bundled agent-host runtime.
execFileSync('tar', ['-czf', target, '--no-mac-metadata', '-s', ',^,package/,S', '--', 'package.json', ...metadata.files], { cwd: root, stdio: 'inherit' })
const entries = execFileSync('tar', ['-tzf', target], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim().split('\n')
if (!entries.includes('package/runtime/Contents/Resources/agent-host/node_modules/@earendil-works/pi-ai/package.json')) throw new Error('Bundled agent dependencies are missing')
const sha256 = createHash('sha256').update(await readFile(target)).digest('hex')
const runtime = JSON.parse(await readFile(join(root, 'runtime', 'version.json'), 'utf8'))
const executableSHA256 = createHash('sha256').update(await readFile(join(root, 'runtime', 'Contents', 'MacOS', 'BeefTV'))).digest('hex')
const manifest = { executableSHA256, plugin: metadata.name, version: metadata.version, runtime, filename: name, sha256, fileCount: entries.length }
await writeFile(join(release, 'BUILD-MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n')
await writeFile(join(release, 'SHA256SUMS'), `${sha256}  ${name}\n`)
console.log(JSON.stringify(manifest, null, 2))
