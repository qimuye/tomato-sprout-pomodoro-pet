import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..')
const petRoot = join(repoRoot, 'public', 'pets', 'tomato-sprout')
const statesDir = join(petRoot, 'states')
const assetsDir = join(petRoot, 'assets')
const docsDir = join(repoRoot, 'docs')

mkdirSync(statesDir, { recursive: true })
mkdirSync(assetsDir, { recursive: true })
mkdirSync(docsDir, { recursive: true })

const states = [
  ['idle', { expression: 'happy', action: 'idle' }],
  ['running', { expression: 'focus', action: 'focus' }],
  ['waving', { expression: 'joy', action: 'wave' }],
  ['jumping', { expression: 'joy', action: 'jump' }],
  ['failed', { expression: 'sad', action: 'failed' }],
  ['waiting', { expression: 'ask', action: 'waiting' }],
  ['review', { expression: 'review', action: 'review' }],
  ['running-right', { expression: 'focus', action: 'right' }],
  ['running-left', { expression: 'focus', action: 'left' }]
]

function defs() {
  return `
  <defs>
    <radialGradient id="body" cx="34%" cy="28%" r="72%">
      <stop offset="0" stop-color="#ff9287"/>
      <stop offset="0.48" stop-color="#f2574f"/>
      <stop offset="1" stop-color="#cf3038"/>
    </radialGradient>
    <radialGradient id="bodyBack" cx="42%" cy="24%" r="74%">
      <stop offset="0" stop-color="#ff8278"/>
      <stop offset="0.56" stop-color="#ea4847"/>
      <stop offset="1" stop-color="#bc2932"/>
    </radialGradient>
    <linearGradient id="leafA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#92e58b"/>
      <stop offset="1" stop-color="#3aae61"/>
    </linearGradient>
    <linearGradient id="leafB" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#86df83"/>
      <stop offset="1" stop-color="#2f9c58"/>
    </linearGradient>
    <filter id="softDepth" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.15"/>
      <feOffset dx="0" dy="1.4" result="offset"/>
      <feComposite in="SourceGraphic" in2="offset" operator="over"/>
    </filter>
    <style>
      .blink {
        animation: blink 5.2s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }

      .blink.r {
        animation-delay: 90ms;
      }

      @keyframes blink {
        0%, 42%, 45%, 100% { transform: scaleY(1); }
        43%, 44% { transform: scaleY(.12); }
      }
    </style>
  </defs>`
}

function leafSet(view = 'front', action = 'idle') {
  const tilt = action === 'right' ? 6 : action === 'left' ? -6 : action === 'jump' ? -3 : 0

  if (view === 'side') {
    return `
      <g transform="rotate(${tilt} 96 45)">
        <path d="M88 49c2-31 25-43 50-31-12 24-27 35-50 31Z" fill="url(#leafB)"/>
        <path d="M83 49c-8-21 1-36 20-45 8 24 2 39-20 45Z" fill="url(#leafA)"/>
        <path d="M90 55c-8-11-2-23 11-30 7 12 3 25-11 30Z" fill="#399f5e" opacity=".88"/>
        <path d="M112 30c8 4 16 4 25 0" fill="none" stroke="#baf0b4" stroke-width="4" stroke-linecap="round" opacity=".4"/>
      </g>`
  }

  if (view === 'back') {
    return `
      <g transform="rotate(${tilt} 96 45)">
        <path d="M92 47c-20-24-46-21-62 2 25 3 45 3 62-2Z" fill="url(#leafB)"/>
        <path d="M100 47c16-27 44-31 64-11-19 15-40 20-64 11Z" fill="url(#leafA)"/>
        <path d="M96 45c-6-27 9-42 28-45 0 26-9 42-28 45Z" fill="#55bd71"/>
        <path d="M84 51c-6-12 1-23 14-29 7 13 3 25-14 29Z" fill="#3ca05e"/>
      </g>`
  }

  return `
    <g transform="rotate(${tilt} 96 45)">
      <path d="M91 47c-22-24-49-22-64 1 26 4 46 4 64-1Z" fill="url(#leafA)"/>
      <path d="M101 47c14-29 43-35 65-15-18 18-39 25-65 15Z" fill="url(#leafB)"/>
      <path d="M96 46c-8-29 8-43 28-46 1 27-8 42-28 46Z" fill="#61c978"/>
      <path d="M84 52c-7-13 0-24 14-30 8 14 3 26-14 30Z" fill="#3ba060"/>
      <path d="M126 26c9 3 17 4 27 0" fill="none" stroke="#baf0b4" stroke-width="4" stroke-linecap="round" opacity=".42"/>
    </g>`
}

function arms(action = 'idle', view = 'front') {
  if (view === 'back') {
    return `
      <path d="M45 111c-19 10-21 27-8 33 12 5 22-7 25-24Z" fill="#d7363f"/>
      <path d="M147 111c19 10 21 27 8 33-12 5-22-7-25-24Z" fill="#d7363f"/>`
  }

  if (view === 'side') {
    return `<path d="M133 112c19 7 27 22 18 32-9 9-24 1-30-18Z" fill="#dd3940"/>`
  }

  if (action === 'wave') {
    return `
      <path d="M48 116c-18 5-25 18-17 28 8 10 25 4 31-13Z" fill="#d9363f"/>
      <path d="M139 103c19-22 37-19 40-3 3 14-14 25-35 18Z" fill="#f15b5b"/>
      <ellipse cx="164" cy="101" rx="16" ry="12" fill="#ff716b" opacity=".72"/>`
  }

  if (action === 'waiting') {
    return `
      <path d="M54 126c-17 6-22 18-13 26 9 8 22 1 28-15Z" fill="#d9363f"/>
      <path d="M138 126c17 6 22 18 13 26-9 8-22 1-28-15Z" fill="#d9363f"/>`
  }

  if (action === 'review') {
    return `
      <path d="M47 116c-18 8-22 22-12 30 10 8 23-1 28-18Z" fill="#d9363f"/>
      <path d="M137 110c17-1 27 9 24 20-3 11-18 12-32 2Z" fill="#ec4d51"/>`
  }

  if (action === 'right') {
    return `
      <path d="M50 122c-18 7-22 20-12 29 9 7 23-1 27-17Z" fill="#d9363f"/>
      <path d="M138 114c18-2 28 8 25 20-3 11-18 13-32 2Z" fill="#ec4d51"/>`
  }

  if (action === 'left') {
    return `
      <path d="M54 114c-18-2-28 8-25 20 3 11 18 13 32 2Z" fill="#ec4d51"/>
      <path d="M142 122c18 7 22 20 12 29-9 7-23-1-27-17Z" fill="#d9363f"/>`
  }

  if (action === 'failed') {
    return `
      <path d="M49 126c-16 6-20 19-10 27 10 7 22-1 26-17Z" fill="#d9363f"/>
      <path d="M143 126c16 6 20 19 10 27-10 7-22-1-26-17Z" fill="#d9363f"/>`
  }

  return `
    <path d="M48 116c-18 6-24 20-15 29 9 9 24 2 30-16Z" fill="#d9363f"/>
    <path d="M144 116c18 6 24 20 15 29-9 9-24 2-30-16Z" fill="#d9363f"/>`
}

function feet(action = 'idle', view = 'front') {
  const lift = action === 'jump' ? 8 : 0
  const leftX = action === 'right' ? 68 : action === 'left' ? 62 : 66
  const rightX = action === 'right' ? 130 : action === 'left' ? 124 : 126

  if (view === 'side') {
    return `<ellipse cx="105" cy="${178 - lift}" rx="18" ry="12" fill="#bd2c34"/>`
  }

  return `
    <ellipse cx="${leftX}" cy="${177 - lift}" rx="18" ry="13" fill="#bd2c34"/>
    <ellipse cx="${rightX}" cy="${177 - lift}" rx="18" ry="13" fill="#bd2c34"/>`
}

function face(expression = 'happy', view = 'front') {
  if (view === 'back') {
    return `<path d="M62 84c22-18 48-19 70-2" fill="none" stroke="#ff7f76" stroke-width="5" stroke-linecap="round" opacity=".22"/>`
  }

  if (view === 'side') {
    return `
      <g class="blink">
        <ellipse cx="117" cy="101" rx="7.5" ry="9.5" fill="#211919"/>
        <circle cx="115" cy="98" r="2.4" fill="#fff" opacity=".92"/>
      </g>
      <ellipse cx="129" cy="121" rx="10" ry="5.5" fill="#ff8f88" opacity=".46"/>
      <path d="M121 118c8 7 17 7 24 0" fill="none" stroke="#361f1f" stroke-width="4.6" stroke-linecap="round"/>`
  }

  if (expression === 'sad') {
    return `
      <path d="M67 102c7-6 14-6 21 0" fill="none" stroke="#251b1b" stroke-width="4.6" stroke-linecap="round"/>
      <path d="M109 102c7-6 14-6 21 0" fill="none" stroke="#251b1b" stroke-width="4.6" stroke-linecap="round"/>
      <ellipse cx="57" cy="120" rx="10" ry="5.5" fill="#ff8f88" opacity=".4"/>
      <ellipse cx="136" cy="120" rx="10" ry="5.5" fill="#ff8f88" opacity=".4"/>
      <path d="M80 134c10-7 22-7 32 0" fill="none" stroke="#361f1f" stroke-width="5" stroke-linecap="round"/>
      <path d="M128 107c5 8 5 15 0 21" fill="none" stroke="#8bd7ff" stroke-width="5" stroke-linecap="round" opacity=".92"/>`
  }

  const eyeScale = expression === 'review' ? 1.12 : 1
  const mouth =
    expression === 'focus'
      ? `<path d="M81 126c10 6 21 6 31 0" fill="none" stroke="#361f1f" stroke-width="4.8" stroke-linecap="round"/>`
      : expression === 'ask'
        ? `<path d="M82 124c11 9 23 9 34 0" fill="none" stroke="#361f1f" stroke-width="5.2" stroke-linecap="round"/>`
        : `
        <path d="M79 119c8 19 31 23 43 1 1-2-1-5-4-5H83c-3 0-5 2-4 4Z" fill="#4c1517"/>
        <ellipse cx="104" cy="132" rx="13" ry="8" fill="#ff7469" opacity=".95"/>`

  return `
    <g class="blink">
      <ellipse cx="72" cy="101" rx="${7.2 * eyeScale}" ry="${9.4 * eyeScale}" fill="#211919"/>
      <circle cx="69.5" cy="97.5" r="2.5" fill="#fff" opacity=".94"/>
      <circle cx="74" cy="105" r="1.2" fill="#fff" opacity=".45"/>
    </g>
    <g class="blink r">
      <ellipse cx="121" cy="101" rx="${7.2 * eyeScale}" ry="${9.4 * eyeScale}" fill="#211919"/>
      <circle cx="118.5" cy="97.5" r="2.5" fill="#fff" opacity=".94"/>
      <circle cx="123" cy="105" r="1.2" fill="#fff" opacity=".45"/>
    </g>
    <ellipse cx="58" cy="121" rx="11" ry="6" fill="#ff8f88" opacity=".48"/>
    <ellipse cx="136" cy="121" rx="11" ry="6" fill="#ff8f88" opacity=".48"/>
    ${mouth}`
}

function body(view = 'front', action = 'idle') {
  const jump = action === 'jump' ? -10 : 0
  const tilt = action === 'right' ? 4 : action === 'left' ? -4 : action === 'review' ? -3 : 0
  const bodyFill = view === 'back' ? 'url(#bodyBack)' : 'url(#body)'
  const rx = view === 'side' ? 51 : 63
  const ry = view === 'side' ? 66 : 65

  return `
    <g transform="translate(0 ${jump}) rotate(${tilt} 96 112)" filter="url(#softDepth)">
      ${arms(action, view)}
      ${feet(action, view)}
      <ellipse cx="96" cy="112" rx="${rx}" ry="${ry}" fill="${bodyFill}"/>
      <ellipse cx="${view === 'side' ? 84 : 75}" cy="85" rx="${view === 'side' ? 24 : 35}" ry="27" fill="#ffffff" opacity=".18"/>
      <path d="M55 104c0-26 18-48 44-55" fill="none" stroke="#ffc4bd" stroke-width="4" stroke-linecap="round" opacity=".42"/>
      ${face(action === 'failed' ? 'sad' : undefined, view)}
    </g>`
}

function character({ view = 'front', expression = 'happy', action = 'idle', x = 0, y = 0, scale = 1, label = '' }) {
  const jump = action === 'jump' ? -8 : 0
  const tilt = action === 'right' ? 4 : action === 'left' ? -4 : action === 'review' ? -4 : 0
  const bodyFill = view === 'back' ? 'url(#bodyBack)' : 'url(#body)'
  const rx = view === 'side' ? 51 : 63
  const ry = view === 'side' ? 66 : 65

  return `
    <g transform="translate(${x} ${y}) scale(${scale})">
      ${label ? `<text x="96" y="204" text-anchor="middle" fill="#7a5a47" font-size="13" font-family="Microsoft YaHei UI, sans-serif">${label}</text>` : ''}
      <g transform="translate(0 ${jump}) rotate(${tilt} 96 112)" filter="url(#softDepth)">
        ${leafSet(view, action)}
        ${arms(action, view)}
        ${feet(action, view)}
        <ellipse cx="96" cy="112" rx="${rx}" ry="${ry}" fill="${bodyFill}"/>
        <ellipse cx="${view === 'side' ? 84 : 75}" cy="85" rx="${view === 'side' ? 24 : 35}" ry="27" fill="#fff" opacity=".18"/>
        <path d="M55 104c0-26 18-48 44-55" fill="none" stroke="#ffc4bd" stroke-width="4" stroke-linecap="round" opacity=".42"/>
        ${face(expression, view)}
      </g>
    </g>`
}

function standaloneSvg(options) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="208" viewBox="0 0 192 208" role="img" aria-label="番茄芽团">
${defs()}
  ${character(options)}
</svg>
`
}

function sheetSvg({ width, height, title, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
${defs()}
  <text x="32" y="38" fill="#2f2723" font-size="24" font-weight="700" font-family="Microsoft YaHei UI, sans-serif">${title}</text>
  ${body}
</svg>
`
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
}

for (const [name, options] of states) {
  write(join(statesDir, `${name}.svg`), standaloneSvg({ ...options, view: 'front' }))
}

write(join(petRoot, 'tomato-sprout.svg'), standaloneSvg({ expression: 'happy', action: 'idle', view: 'front' }))
write(join(repoRoot, 'video-showcase', 'assets', 'tomato-sprout.svg'), standaloneSvg({ expression: 'happy', action: 'idle', view: 'front' }))

write(
  join(assetsDir, 'ip-turnaround.svg'),
  sheetSvg({
    width: 760,
    height: 300,
    title: '番茄芽团 IP 三视图',
    body: `
      ${character({ view: 'front', expression: 'joy', action: 'idle', x: 46, y: 48, scale: 1, label: '正面' })}
      ${character({ view: 'side', expression: 'joy', action: 'idle', x: 282, y: 48, scale: 1, label: '侧面' })}
      ${character({ view: 'back', expression: 'joy', action: 'idle', x: 518, y: 48, scale: 1, label: '背面' })}`
  })
)

write(
  join(assetsDir, 'expression-sheet.svg'),
  sheetSvg({
    width: 800,
    height: 560,
    title: '番茄芽团表情表',
    body: `
      ${character({ expression: 'happy', action: 'idle', x: 34, y: 62, scale: .88, label: '开心' })}
      ${character({ expression: 'focus', action: 'focus', x: 214, y: 62, scale: .88, label: '专注' })}
      ${character({ expression: 'joy', action: 'wave', x: 394, y: 62, scale: .88, label: '打招呼' })}
      ${character({ expression: 'ask', action: 'waiting', x: 574, y: 62, scale: .88, label: '等待' })}
      ${character({ expression: 'review', action: 'review', x: 34, y: 302, scale: .88, label: '查看' })}
      ${character({ expression: 'sad', action: 'failed', x: 214, y: 302, scale: .88, label: '委屈' })}
      ${character({ expression: 'joy', action: 'jump', x: 394, y: 302, scale: .88, label: '提醒' })}
      ${character({ expression: 'happy', action: 'left', x: 574, y: 302, scale: .88, label: '拖动' })}`
  })
)

write(
  join(assetsDir, 'action-sheet.svg'),
  sheetSvg({
    width: 800,
    height: 780,
    title: '番茄芽团动作表',
    body: states
      .map(([name, options], index) => {
        const col = index % 3
        const row = Math.floor(index / 3)
        const labelMap = {
          idle: '待命',
          running: '专注',
          waving: '短休',
          jumping: '提醒',
          failed: '异常',
          waiting: '暂停',
          review: '悬停',
          'running-right': '右拖',
          'running-left': '左拖'
        }
        return character({
          ...options,
          x: 54 + col * 240,
          y: 70 + row * 220,
          scale: .82,
          label: labelMap[name]
        })
      })
      .join('\n')
  })
)

write(
  join(assetsDir, 'asset-manifest.json'),
  `${JSON.stringify(
    {
      id: 'tomato-sprout',
      displayName: '番茄芽团',
      version: 'ip-v1-svg',
      description: '圆润番茄身体、三片嫩芽、大亮眼、两只小手和小脚的 3D 玩具感桌宠 IP。',
      source: 'Codex generated SVG asset library based on the approved tomato sprout cover direction.',
      files: {
        activePet: '../tomato-sprout.svg',
        turnaround: 'ip-turnaround.svg',
        expressionSheet: 'expression-sheet.svg',
        actionSheet: 'action-sheet.svg',
        states: Object.fromEntries(states.map(([name]) => [name, `../states/${name}.svg`]))
      },
      stateMeaning: {
        idle: '待命和轻微呼吸',
        running: '专注中',
        waving: '休息或俏皮互动',
        jumping: '到点提醒',
        failed: '异常或委屈',
        waiting: '暂停等待',
        review: '悬停查看番茄钟信息',
        'running-right': '向右拖动',
        'running-left': '向左拖动'
      }
    },
    null,
    2
  )}\n`
)

write(
  join(docsDir, 'tomato-sprout-ip-assets.md'),
  `# 番茄芽团 IP 资产库

本轮把封面里确认较可爱的番茄形象沉淀为项目原生 SVG 资产，优先保证透明、可版本管理、可直接替换桌宠。

## 资产位置

- 主宠物：\`public/pets/tomato-sprout/tomato-sprout.svg\`
- 状态图：\`public/pets/tomato-sprout/states/*.svg\`
- 三视图：\`public/pets/tomato-sprout/assets/ip-turnaround.svg\`
- 表情表：\`public/pets/tomato-sprout/assets/expression-sheet.svg\`
- 动作表：\`public/pets/tomato-sprout/assets/action-sheet.svg\`
- 资产清单：\`public/pets/tomato-sprout/assets/asset-manifest.json\`

## IP 设定

- 名称：番茄芽团
- 气质：治愈陪伴、俏皮但低打扰、像桌面上会动的小摆件
- 造型：圆润番茄身体，三片嫩芽，大亮眼，张嘴笑，两只小手，两只小脚
- 材质：偏 3D 玩具感，番茄身体有柔和高光，嫩芽保持清爽绿色

## 下一步

当前版本是 SVG 状态资产，已经能在桌宠里切换不同状态图。后续如果要做更顺滑的逐帧动画，可以把这些资产作为参考，继续用 hatch-pet 生成正式 \`spritesheet.webp\` 和 \`pet.json\`。
`
)

console.log(`Generated Tomato Sprout IP assets in ${petRoot}`)
