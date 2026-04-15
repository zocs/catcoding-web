/**
 * 🐱 CatCoding — 猫咪捕猎鼠标动画
 *
 * 猫咪状态机:
 *   idle → stalking → pouncing → catching → victory
 *
 * 鼠标自定义光标:
 *   正常: 🧶 毛球  |  被追踪: 🐟 小鱼干
 */

;(function () {
  const canvas = document.createElement('canvas')
  canvas.id = 'cat-hunt-canvas'
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '9999',
  })
  document.body.prepend(canvas)
  const ctx = canvas.getContext('2d')

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  resize()
  window.addEventListener('resize', resize)

  // ═══ 状态 ═══
  let mouseX = canvas.width / 2
  let mouseY = canvas.height / 2
  let mouseOnPage = false

  // 猫咪对象
  const cat = {
    x: 100, y: canvas.height - 120,
    targetX: 100, targetY: canvas.height - 120,
    state: 'idle',        // idle | stalking | pouncing | catching | victory | returning
    stateTimer: 0,
    facing: 1,            // 1=右, -1=左
    size: 40,
    eyeOpen: 1,           // 0-1 眼睛开合
    blinkTimer: 0,
    earAngle: 0,
    tailAngle: 0,
    tailWag: 0,
    crouch: 0,            // 0=站立, 1=蹲伏
    pounceCharge: 0,
    victoryDance: 0,
    pupilDx: 0, pupilDy: 0, // 瞳孔追踪
    breathPhase: 0,
    whiskerTwitch: 0,
    // 速度
    vx: 0, vy: 0,
    // 距离鼠标
    distToMouse: 999,
    // 被抓计时
    caughtTimer: 0,
    // 返回起点
    homeX: 100, homeY: canvas.height - 120,
  }

  // ═══ 浮动装饰（背景） ═══
  const bgParticles = []
  for (let i = 0; i < 8; i++) {
    bgParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 6 + Math.random() * 10,
      opacity: 0.04 + Math.random() * 0.06,
      vy: -(0.15 + Math.random() * 0.25),
      vx: (Math.random() - 0.5) * 0.2,
      type: ['paw', 'fish', 'star'][Math.floor(Math.random() * 3)],
      rot: Math.random() * 6.28,
      rotV: (Math.random() - 0.5) * 0.005,
    })
  }

  // ═══ 胜利粒子 ═══
  const victoryParticles = []

  // ═══ 绘制工具 ═══
  function drawPawPrint(c, x, y, s, a) {
    c.save(); c.globalAlpha = a; c.fillStyle = '#f5a623'; c.translate(x, y)
    c.beginPath(); c.ellipse(0, s * 0.15, s * 0.4, s * 0.3, 0, 0, Math.PI * 2); c.fill()
    for (const [ox, oy, r] of [[-0.3, -0.18, 0.17], [-0.1, -0.38, 0.17], [0.1, -0.38, 0.17], [0.3, -0.18, 0.17]]) {
      c.beginPath(); c.ellipse(ox * s, oy * s, r * s, r * s * 0.85, 0, 0, Math.PI * 2); c.fill()
    }
    c.restore()
  }

  function drawFishEmoji(c, x, y, s, a) {
    c.save(); c.globalAlpha = a; c.fillStyle = '#ff8a65'; c.translate(x, y)
    c.beginPath(); c.ellipse(0, 0, s * 0.5, s * 0.25, 0, 0, Math.PI * 2); c.fill()
    c.beginPath(); c.moveTo(s * 0.4, 0); c.lineTo(s * 0.7, -s * 0.22); c.lineTo(s * 0.7, s * 0.22); c.closePath(); c.fill()
    c.fillStyle = '#333'; c.beginPath(); c.arc(-s * 0.18, -s * 0.03, s * 0.05, 0, Math.PI * 2); c.fill()
    c.restore()
  }

  // ═══ 绘制猫咪（改进版：渐变毛色 + 虎斑纹 + 毛绒感） ═══
  // 颜色系统
  const COL = {
    body:     '#f5a623',  // 橘猫主色
    bodyDark: '#d4881a',  // 暗部
    bodyLight:'#ffb84d',  // 亮部
    belly:    '#ffe0b2',  // 肚皮
    bellyEdge:'#ffd08a',  // 肚皮边缘
    nose:     '#e88888',  // 鼻子
    noseDk:   '#cc6666',  // 鼻子暗部
    innerEar: '#ffaaaa',  // 耳内
    innerEarDk:'#ee8888',
    eyeWhite: '#fefefe',  // 眼白（微黄白，更自然）
    iris:     '#4a7c2e',  // 虹膜（猫绿）
    irisRing: '#2d5a16',  // 虹膜外环
    pupil:    '#111111',  // 瞳孔
    pupilHi:  '#ffffff',  // 瞳孔高光
    whisker:  '#bbbbbb',  // 胡须
    stripe:   '#c87818',  // 虎斑纹
    shadow:   'rgba(0,0,0,0.08)', // 投影
  }

  function drawCat(c) {
    c.save()
    c.translate(cat.x, cat.y)
    c.scale(cat.facing, 1)

    const s = cat.size
    const breathe = Math.sin(cat.breathPhase) * 1.5
    const crouchY = cat.crouch * s * 0.3
    const squish = cat.state === 'catching' ? 0.88 : 1

    // ── 阴影（脚下投影）──
    c.fillStyle = COL.shadow
    c.beginPath()
    c.ellipse(0, s * 0.52, s * 0.45, s * 0.06, 0, 0, Math.PI * 2)
    c.fill()

    // ── 尾巴（多段渐变，毛茸茸感）──
    c.save()
    c.translate(-s * 0.55, -s * 0.05 + crouchY)
    const tailWave = Math.sin(cat.tailAngle) * 0.35
    const tailWave2 = Math.sin(cat.tailAngle + 0.8) * 0.2
    // 三层尾巴（从粗到细，从深到浅）
    for (let layer = 0; layer < 3; layer++) {
      const w = s * (0.14 - layer * 0.03)
      const alpha = 1 - layer * 0.15
      c.strokeStyle = layer === 0 ? COL.bodyDark : (layer === 1 ? COL.body : COL.bodyLight)
      c.lineWidth = w; c.lineCap = 'round'; c.globalAlpha = alpha
      c.beginPath(); c.moveTo(0, 0)
      c.bezierCurveTo(
        -s * 0.25, -s * 0.15 + tailWave * s,
        -s * 0.35, -s * 0.45 + tailWave2 * s,
        -s * 0.15 + Math.sin(cat.tailAngle + 1.5) * s * 0.12, -s * 0.65
      )
      c.stroke()
    }
    c.globalAlpha = 1
    c.restore()

    // ── 身体（渐变填充）──
    const bodyGrad = c.createRadialGradient(s * 0.08, s * 0.08 + crouchY, s * 0.1, 0, s * 0.15 + crouchY, s * 0.5)
    bodyGrad.addColorStop(0, COL.bodyLight)
    bodyGrad.addColorStop(0.5, COL.body)
    bodyGrad.addColorStop(1, COL.bodyDark)
    c.fillStyle = bodyGrad
    c.beginPath()
    c.ellipse(0, s * 0.15 + crouchY, s * 0.5, s * 0.35 * squish, 0, 0, Math.PI * 2)
    c.fill()

    // ── 虎斑纹（身体）──
    c.strokeStyle = COL.stripe; c.lineWidth = s * 0.025; c.lineCap = 'round'; c.globalAlpha = 0.35
    // 背部 M 形条纹
    for (let i = -2; i <= 2; i++) {
      const sx = i * s * 0.12
      const sy = s * 0.08 + crouchY
      c.beginPath(); c.moveTo(sx - s * 0.04, sy - s * 0.06)
      c.quadraticCurveTo(sx, sy + s * 0.02, sx + s * 0.04, sy - s * 0.06)
      c.stroke()
    }
    c.globalAlpha = 1

    // ── 肚皮（椭圆渐变）──
    const bellyGrad = c.createRadialGradient(0, s * 0.22 + crouchY, 0, 0, s * 0.2 + crouchY, s * 0.32)
    bellyGrad.addColorStop(0, COL.belly)
    bellyGrad.addColorStop(0.8, COL.bellyEdge)
    bellyGrad.addColorStop(1, COL.body)
    c.fillStyle = bellyGrad
    c.beginPath()
    c.ellipse(0, s * 0.2 + crouchY, s * 0.3, s * 0.2 * squish, 0, 0, Math.PI * 2)
    c.fill()

    // ── 前爪（带肉垫细节）──
    const pawExtend = cat.state === 'pouncing' ? cat.pounceCharge * s * 0.3 : 0
    for (const side of [-1, 1]) {
      // 爪子主体（渐变）
      const px = side * s * 0.3
      const py = s * 0.42 + crouchY + pawExtend * 0.3
      const pawGrad = c.createRadialGradient(px, py, 0, px, py, s * 0.12)
      pawGrad.addColorStop(0, COL.body)
      pawGrad.addColorStop(1, COL.bodyDark)
      c.fillStyle = pawGrad
      c.beginPath()
      c.ellipse(px, py, s * 0.1, s * 0.08, side * 0.2, 0, Math.PI * 2)
      c.fill()

      // 肉垫（三瓣）
      c.fillStyle = '#d48060'
      c.beginPath(); c.ellipse(px, py + s * 0.02, s * 0.045, s * 0.03, 0, 0, Math.PI * 2); c.fill()
      c.fillStyle = '#cc7755'
      c.beginPath(); c.arc(px - s * 0.04, py - s * 0.03, s * 0.022, 0, Math.PI * 2); c.fill()
      c.beginPath(); c.arc(px + s * 0.04, py - s * 0.03, s * 0.022, 0, Math.PI * 2); c.fill()
    }

    // ── 后爪（蹲伏时可见）──
    if (cat.crouch > 0.3) {
      for (const side of [-1, 1]) {
        c.fillStyle = COL.bodyDark
        c.beginPath()
        c.ellipse(side * s * 0.2, s * 0.45 + crouchY, s * 0.12, s * 0.07, 0, 0, Math.PI * 2)
        c.fill()
      }
    }

    // ── 头部（渐变）──
    const headY = -s * 0.25 + crouchY + breathe
    const headGrad = c.createRadialGradient(s * 0.06, headY - s * 0.06, s * 0.05, 0, headY, s * 0.42)
    headGrad.addColorStop(0, COL.bodyLight)
    headGrad.addColorStop(0.5, COL.body)
    headGrad.addColorStop(1, COL.bodyDark)
    c.fillStyle = headGrad
    c.beginPath(); c.arc(0, headY, s * 0.38, 0, Math.PI * 2); c.fill()

    // ── 额头虎斑纹 ──
    c.strokeStyle = COL.stripe; c.lineWidth = s * 0.022; c.globalAlpha = 0.4; c.lineCap = 'round'
    // 额头 M 纹
    const mY = headY - s * 0.18
    c.beginPath()
    c.moveTo(-s * 0.15, mY + s * 0.05)
    c.quadraticCurveTo(-s * 0.08, mY - s * 0.06, 0, mY + s * 0.02)
    c.quadraticCurveTo(s * 0.08, mY - s * 0.06, s * 0.15, mY + s * 0.05)
    c.stroke()
    // 竖线
    c.beginPath(); c.moveTo(0, mY + s * 0.02); c.lineTo(0, mY + s * 0.12); c.stroke()
    c.globalAlpha = 1

    // ── 耳朵（更圆润，有内耳渐变）──
    const earW = Math.sin(cat.earAngle) * 0.1
    for (const side of [-1, 1]) {
      c.save()
      c.translate(side * s * 0.26, headY - s * 0.3)
      c.rotate(side * (-0.12 + earW * side))

      // 外耳
      c.fillStyle = COL.body
      c.beginPath()
      c.moveTo(-side * s * 0.02, s * 0.02)
      c.quadraticCurveTo(side * s * 0.12, -s * 0.32, side * s * 0.18, -s * 0.05)
      c.quadraticCurveTo(side * s * 0.05, s * 0.02, -side * s * 0.02, s * 0.02)
      c.fill()

      // 内耳（渐变粉）
      const earInnerGrad = c.createLinearGradient(0, -s * 0.22, 0, s * 0.02)
      earInnerGrad.addColorStop(0, COL.innerEar)
      earInnerGrad.addColorStop(1, COL.innerEarDk)
      c.fillStyle = earInnerGrad
      c.beginPath()
      c.moveTo(-side * s * 0.01, s * 0.01)
      c.quadraticCurveTo(side * s * 0.08, -s * 0.22, side * s * 0.13, -s * 0.02)
      c.quadraticCurveTo(side * s * 0.03, s * 0.01, -side * s * 0.01, s * 0.01)
      c.fill()

      c.restore()
    }

    // ── 眼睛（虹膜 + 瞳孔 + 高光，更逼真）──
    const eyeY = headY - s * 0.04
    const eyeSpacing = s * 0.15
    if (cat.eyeOpen > 0.1) {
      const eyeR = s * 0.1 * cat.eyeOpen
      const eyeRy = s * 0.09 * cat.eyeOpen

      for (const side of [-1, 1]) {
        const ex = side * eyeSpacing

        // 眼白
        c.fillStyle = COL.eyeWhite
        c.beginPath(); c.ellipse(ex, eyeY, eyeR, eyeRy, 0, 0, Math.PI * 2); c.fill()

        // 虹膜（渐变绿）
        const irisGrad = c.createRadialGradient(ex, eyeY, 0, ex, eyeY, eyeR * 0.7)
        irisGrad.addColorStop(0, COL.iris)
        irisGrad.addColorStop(0.7, COL.irisRing)
        irisGrad.addColorStop(1, COL.pupil)
        c.fillStyle = irisGrad
        c.beginPath(); c.arc(ex, eyeY, eyeR * 0.65, 0, Math.PI * 2); c.fill()

        // 瞳孔（竖瞳 — 猫的特征！）
        c.fillStyle = COL.pupil
        c.beginPath()
        c.ellipse(
          ex + cat.pupilDx * s * 0.02,
          eyeY + cat.pupilDy * s * 0.02,
          s * 0.018 * cat.eyeOpen,  // 窄
          s * 0.06 * cat.eyeOpen,   // 长
          0, 0, Math.PI * 2
        )
        c.fill()

        // 高光（大+小，更生动）
        c.fillStyle = COL.pupilHi
        c.beginPath(); c.arc(ex + s * 0.025, eyeY - s * 0.025, s * 0.025, 0, Math.PI * 2); c.fill()
        c.globalAlpha = 0.6
        c.beginPath(); c.arc(ex - s * 0.015, eyeY + s * 0.02, s * 0.012, 0, Math.PI * 2); c.fill()
        c.globalAlpha = 1

        // 眼睛轮廓（轻微深色描边）
        c.strokeStyle = COL.bodyDark; c.lineWidth = s * 0.015
        c.beginPath(); c.ellipse(ex, eyeY, eyeR, eyeRy, 0, 0, Math.PI * 2); c.stroke()
      }
    } else {
      // 闭眼 — 柔和弧线
      c.strokeStyle = COL.stripe; c.lineWidth = s * 0.025; c.lineCap = 'round'
      for (const side of [-1, 1]) {
        c.beginPath()
        c.arc(side * eyeSpacing, eyeY, s * 0.055, 0.15, Math.PI - 0.15)
        c.stroke()
      }
    }

    // ── 鼻子（更立体）──
    const noseY = headY + s * 0.06
    // 鼻梁暗部
    c.fillStyle = COL.noseDk
    c.beginPath()
    c.moveTo(0, noseY - s * 0.01)
    c.lineTo(-s * 0.035, noseY + s * 0.02); c.lineTo(s * 0.035, noseY + s * 0.02)
    c.closePath(); c.fill()
    // 鼻尖亮部
    c.fillStyle = COL.nose
    c.beginPath()
    c.moveTo(0, noseY)
    c.lineTo(-s * 0.028, noseY + s * 0.015); c.lineTo(s * 0.028, noseY + s * 0.015)
    c.closePath(); c.fill()
    // 鼻孔
    c.fillStyle = COL.noseDk
    c.beginPath(); c.ellipse(-s * 0.012, noseY + s * 0.01, s * 0.008, s * 0.005, 0, 0, Math.PI * 2); c.fill()
    c.beginPath(); c.ellipse(s * 0.012, noseY + s * 0.01, s * 0.008, s * 0.005, 0, 0, Math.PI * 2); c.fill()

    // ── 嘴巴（更自然）──
    const mouthY = noseY + s * 0.02
    c.strokeStyle = COL.stripe; c.lineWidth = s * 0.018; c.lineCap = 'round'
    if (cat.state === 'victory') {
      // 开心大嘴（更圆润）
      c.fillStyle = '#cc5555'
      c.beginPath()
      c.arc(0, mouthY + s * 0.06, s * 0.09, 0.05, Math.PI - 0.05)
      c.fill()
      // 舌头
      c.fillStyle = '#ff7777'
      c.beginPath()
      c.ellipse(0, mouthY + s * 0.11, s * 0.045, s * 0.035, 0, Math.PI, Math.PI * 2)
      c.fill()
      // 舌头中线
      c.strokeStyle = '#ee5555'; c.lineWidth = s * 0.008
      c.beginPath(); c.moveTo(0, mouthY + s * 0.08); c.lineTo(0, mouthY + s * 0.14); c.stroke()
    } else if (cat.state === 'pouncing') {
      // 专注 — 微张嘴
      c.fillStyle = '#aa4444'
      c.beginPath(); c.ellipse(0, mouthY + s * 0.05, s * 0.04, s * 0.02, 0, 0, Math.PI * 2); c.fill()
    } else {
      // 正常 — 猫嘴（W 形）
      c.beginPath()
      c.moveTo(-s * 0.06, mouthY + s * 0.03)
      c.quadraticCurveTo(-s * 0.02, mouthY + s * 0.08, 0, mouthY + s * 0.04)
      c.stroke()
      c.beginPath()
      c.moveTo(0, mouthY + s * 0.04)
      c.quadraticCurveTo(s * 0.02, mouthY + s * 0.08, s * 0.06, mouthY + s * 0.03)
      c.stroke()
    }

    // ── 胡须（更粗更自然，有弯曲）──
    const wTwitch = Math.sin(cat.whiskerTwitch) * s * 0.015
    c.lineWidth = s * 0.015; c.lineCap = 'round'
    for (const side of [-1, 1]) {
      for (let j = 0; j < 3; j++) {
        const baseY = mouthY - s * 0.01 + j * s * 0.025
        const tipY = baseY + (j - 1) * s * 0.04 + wTwitch * (j - 1)
        const len = s * (0.35 + j * 0.05)
        c.strokeStyle = j === 1 ? COL.whisker : '#aaaaaa'
        c.globalAlpha = 0.7
        c.beginPath()
        c.moveTo(side * s * 0.15, baseY)
        c.quadraticCurveTo(
          side * s * 0.28, tipY - s * 0.02,
          side * len, tipY
        )
        c.stroke()
      }
    }
    c.globalAlpha = 1

    c.restore()
  }

  // ═══ 绘制自定义光标 ═══
  function drawCursor(c) {
    if (!mouseOnPage) return

    const isStalked = cat.state === 'stalking' || cat.state === 'pouncing'
    const s = 14

    c.save()
    c.translate(mouseX, mouseY)

    if (isStalked) {
      // 被追踪 → 小鱼干
      const wiggle = Math.sin(Date.now() * 0.005) * 0.15
      c.rotate(wiggle)
      drawFishEmoji(c, 0, 0, s, 0.85)
    } else {
      // 正常 → 毛线球
      const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.05
      c.scale(pulse, pulse)
      c.globalAlpha = 0.7
      c.strokeStyle = '#e91e63'; c.lineWidth = 2.5; c.lineCap = 'round'
      c.beginPath(); c.arc(0, 0, s * 0.5, 0, Math.PI * 2); c.stroke()
      for (let i = -1; i <= 1; i++) {
        c.beginPath(); c.arc(i * 4, 0, s * 0.42, -0.6, 0.6); c.stroke()
      }
      // 线头
      c.beginPath(); c.moveTo(s * 0.45, s * 0.1)
      c.quadraticCurveTo(s * 0.7, s * 0.4, s * 0.5, s * 0.6); c.stroke()
    }

    c.restore()
  }

  // ═══ 状态机逻辑 ═══
  function updateCat() {
    cat.stateTimer++
    cat.breathPhase += 0.04
    cat.tailAngle += 0.04
    cat.whiskerTwitch += 0.06

    // 瞳孔追踪鼠标
    const dx = mouseX - cat.x
    const dy = mouseY - cat.y
    cat.distToMouse = Math.sqrt(dx * dx + dy * dy)
    const dist = cat.distToMouse || 1
    cat.pupilDx = (dx / dist) * Math.min(dist / 200, 1)
    cat.pupilDy = (dy / dist) * Math.min(dist / 200, 1)
    cat.facing = dx > 0 ? 1 : -1

    // 眨眼
    cat.blinkTimer--
    if (cat.blinkTimer <= 0) {
      cat.eyeOpen = 0
      if (cat.blinkTimer < -5) {
        cat.eyeOpen = 1
        cat.blinkTimer = 120 + Math.random() * 200
      }
    }

    // 耳朵摆动
    cat.earAngle += 0.03

    switch (cat.state) {
      case 'idle': {
        cat.crouch = 0
        cat.tailWag = Math.sin(Date.now() * 0.002) * 0.3
        cat.eyeOpen = Math.max(cat.eyeOpen, 0.8)

        // 鼠标靠近 → 开始追踪
        if (mouseOnPage && cat.distToMouse < 400) {
          cat.state = 'stalking'
          cat.stateTimer = 0
        }

        // 缓慢返回家
        cat.x += (cat.homeX - cat.x) * 0.01
        cat.y += (cat.homeY - cat.y) * 0.01
        break
      }

      case 'stalking': {
        // 潜行靠近
        cat.crouch = Math.min(cat.crouch + 0.02, 0.7)
        cat.eyeOpen = 1 // 睁大眼睛

        // 缓慢靠近鼠标
        const speed = 1.2
        cat.x += (mouseX - cat.x) * 0.02
        cat.y += (mouseY - cat.y) * 0.02

        // 距离够近 → 蓄力
        if (cat.distToMouse < 80) {
          cat.state = 'pouncing'
          cat.stateTimer = 0
          cat.pounceCharge = 0
        }

        // 鼠标跑远了 → 放弃
        if (!mouseOnPage || cat.distToMouse > 600) {
          cat.state = 'idle'
          cat.stateTimer = 0
        }
        break
      }

      case 'pouncing': {
        // 蓄力蹲伏
        cat.crouch = 1
        cat.pounceCharge = Math.min(cat.pounceCharge + 0.025, 1)

        // 蓄力满 → 扑上去！
        if (cat.pounceCharge >= 1) {
          cat.state = 'catching'
          cat.stateTimer = 0
          cat.caughtTimer = 0
        }
        break
      }

      case 'catching': {
        // 飞扑
        cat.crouch = Math.max(cat.crouch - 0.08, 0)
        const catchSpeed = 0.15
        cat.x += (mouseX - cat.x) * catchSpeed
        cat.y += (mouseY - cat.y) * catchSpeed

        if (cat.distToMouse < 25) {
          cat.caughtTimer++
          // 抓住 2-3 秒 → 胜利
          if (cat.caughtTimer > 120) {
            cat.state = 'victory'
            cat.stateTimer = 0
            cat.victoryDance = 0
            spawnVictoryBurst()
          }
        } else {
          cat.caughtTimer = Math.max(0, cat.caughtTimer - 2)
        }

        // 超时没抓到 → 回到追踪
        if (cat.stateTimer > 180) {
          cat.state = 'stalking'
          cat.stateTimer = 0
        }
        break
      }

      case 'victory': {
        // 胜利舞蹈
        cat.victoryDance += 0.08
        cat.y = cat.homeY + Math.abs(Math.sin(cat.victoryDance * 2)) * -15
        cat.x += Math.sin(cat.victoryDance * 3) * 1.5
        cat.crouch = 0
        cat.eyeOpen = 1

        // 舞蹈结束 → 回家
        if (cat.stateTimer > 200) {
          cat.state = 'returning'
          cat.stateTimer = 0
        }
        break
      }

      case 'returning': {
        cat.crouch = 0
        cat.x += (cat.homeX - cat.x) * 0.03
        cat.y += (cat.homeY - cat.y) * 0.03
        if (Math.abs(cat.x - cat.homeX) < 5 && Math.abs(cat.y - cat.homeY) < 5) {
          cat.state = 'idle'
          cat.stateTimer = 0
        }
        break
      }
    }
  }

  // ═══ 胜利粒子 ═══
  function spawnVictoryBurst() {
    const emojis = ['⭐', '🎉', '🐟', '✨', '🐾', '💛']
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.3
      const speed = 2 + Math.random() * 4
      victoryParticles.push({
        x: cat.x, y: cat.y - 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0, max: 60 + Math.random() * 30,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 12 + Math.random() * 10,
        rot: Math.random() * 6.28,
        rotV: (Math.random() - 0.5) * 0.1,
      })
    }
  }

  function updateVictoryParticles() {
    for (let i = victoryParticles.length - 1; i >= 0; i--) {
      const p = victoryParticles[i]
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++; p.rot += p.rotV
      if (p.life > p.max) { victoryParticles.splice(i, 1); continue }
      const alpha = 1 - p.life / p.max
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.font = `${p.size}px serif`
      ctx.textAlign = 'center'
      ctx.fillText(p.emoji, 0, 0)
      ctx.restore()
    }
  }

  // ═══ 状态文字 ═══
  function drawStateLabel(c) {
    const labels = {
      idle: '',
      stalking: '🐾 悄悄靠近...',
      pouncing: '⚡ 蓄力中...',
      catching: '💨 扑！！',
      victory: '🎉 抓到了！',
      returning: '🚶 回家...',
    }
    const label = labels[cat.state]
    if (!label) return
    c.save()
    c.globalAlpha = 0.8
    c.font = '13px "Noto Sans SC", sans-serif'
    c.fillStyle = '#f5a623'
    c.textAlign = 'center'
    c.fillText(label, cat.x, cat.y - cat.size - 10)
    c.restore()
  }

  // ═══ 主循环 ═══
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 背景浮动
    for (const p of bgParticles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV
      if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width }
      if (p.type === 'paw') drawPawPrint(ctx, p.x, p.y, p.size, p.opacity)
      else if (p.type === 'fish') drawFishEmoji(ctx, p.x, p.y, p.size, p.opacity)
      else { ctx.save(); ctx.globalAlpha = p.opacity; ctx.fillStyle = '#ffd54f';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore() }
    }

    updateCat()
    drawCat(ctx)
    drawStateLabel(ctx)
    updateVictoryParticles()
    drawCursor(ctx)

    requestAnimationFrame(frame)
  }

  // ═══ 事件 ═══
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    mouseOnPage = true
  })
  document.addEventListener('mouseleave', () => { mouseOnPage = false })

  // 触屏支持
  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0]
    mouseX = t.clientX; mouseY = t.clientY; mouseOnPage = true
  }, { passive: true })
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0]
    mouseX = t.clientX; mouseY = t.clientY; mouseOnPage = true
  }, { passive: true })
  document.addEventListener('touchend', () => { mouseOnPage = false })

  // ═══ 启动 ═══
  requestAnimationFrame(frame)
})()
