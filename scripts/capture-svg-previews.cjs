const { app, BrowserWindow } = require('electron')
const { mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const { basename, join, resolve } = require('node:path')

const files = process.argv.slice(2).map((file) => resolve(file))
const outDir = resolve('renders', 'asset-qa')

function svgSize(file) {
  const text = readFileSync(file, 'utf8')
  const width = Number(text.match(/\bwidth="(\d+)"/)?.[1] ?? 800)
  const height = Number(text.match(/\bheight="(\d+)"/)?.[1] ?? 600)
  return { width, height }
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms))
}

async function main() {
  await app.whenReady()
  mkdirSync(outDir, { recursive: true })

  for (const file of files) {
    const { width, height } = svgSize(file)
    const win = new BrowserWindow({
      width,
      height,
      show: false,
      transparent: true,
      webPreferences: {
        backgroundThrottling: false
      }
    })

    await win.loadFile(file)
    await wait(180)
    const image = await win.webContents.capturePage()
    const outFile = join(outDir, `${basename(file, '.svg')}.png`)
    writeFileSync(outFile, image.toPNG())
    win.close()
    console.log(outFile)
  }

  app.quit()
}

main().catch((error) => {
  console.error(error)
  app.quit()
  process.exitCode = 1
})
