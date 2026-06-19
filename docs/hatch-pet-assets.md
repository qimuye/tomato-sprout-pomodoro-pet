# 番茄芽团正式精灵图流程

当前项目已接入 `PetManifest`，可以从 SVG 占位宠物替换为 `hatch-pet` 生成的 9 状态 atlas。

## 角色设定

- 名称：番茄芽团
- 气质：治愈陪伴、低打扰、像桌面小摆件
- 视觉：3D 软玩具质感，小番茄身体，嫩芽叶片作为情绪和动作重点
- 避免：文字、Logo、白底、阴影、场景、漂浮符号、速度线、复杂道具

## 主视觉提示词

```text
Create a compact full-body desktop pet mascot on a perfectly flat #ff00ff chroma-key background for later transparency extraction.
Subject: a tiny tomato sprout companion named Tomato Sprout, with a round soft tomato body, two small plush leaf sprouts on top, tiny dot eyes, a warm gentle smile, and small rounded feet.
Style: 3D soft toy, matte plush-vinyl hybrid, clean simple shapes, readable at 192x208 px, warm and calming.
Composition: centered full body, generous padding, no cropping.
Constraints: no text, no logo, no scenery, no cast shadow, no floor, no floating effects, no watermark. Do not use #ff00ff in the pet.
```

## 状态映射

项目使用这些状态行，和 Codex 宠物 atlas 约定保持一致：

| Row | State | App meaning |
| --- | --- | --- |
| 0 | idle | 停止或待命 |
| 1 | running-right | 向右拖动 |
| 2 | running-left | 向左拖动 |
| 3 | waving | 休息中 |
| 4 | jumping | 到点提醒 |
| 5 | failed | 预留异常状态 |
| 6 | waiting | 暂停 |
| 7 | running | 专注中 |
| 8 | review | 悬停查看时间 |

生成完成后，把 `spritesheet.webp` 放到 `public/pets/tomato-sprout/spritesheet.webp`，并将 `public/pets/tomato-sprout/pet.json` 的 `renderMode` 改为 `atlas`、`spritesheetPath` 改为 `pets/tomato-sprout/spritesheet.webp`。
