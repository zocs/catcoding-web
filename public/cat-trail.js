/**
 * 🐱 CatCoding 网站猫咪跟随动效
 * - 浮动猫咪剪影（猫爪、猫头、小鱼干、毛线球）
 * - 鼠标跟随二次曲线轨迹粒子
 * - 猫头变形动画（眨眼、张嘴、竖耳）
 */

;(function () {
  // 创建画布
  const canvas = document.createElement('canvas')
  canvas.id = 'cat-trail-canvas'
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: '9999',
  })
  document.body.prepend(canvas)
  const ctx = canvas.getContext('2d')

  function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // ═══ 粒子系统 ═══
  const floaters = []
  const trails = []
  let mx = 0, my = 0, lastTrail = 0

  // 浮动元素类型
  const TYPES = ['paw', 'cathead', 'fish', 'yarn', 'star']

  function spawnFloater() {
    const w = canvas.width, h = canvas.height
    floaters.push({
      x: Math.random() * w,
      y: h + 30,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.2 + Math.random() * 0.4),
      size: 10 + Math.random() * 16,
      opacity: 0.06 + Math.random() * 0.1,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.008,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      life: 0,
      max: 500 + Math.random() * 400,
      // 猫头状态
      blink: 0,
      blinkTimer: Math.random() * 200,
      mouthOpen: 0,
      earWiggle: 0,
    })
  }

  // 初始填充
  for (let i = 0; i < 12; i++) {
    const f = { life: Math.random() * 300, max: 600 }
    Object.assign(f, { x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2, vy: -(0.1 + Math.random() * 0.2),
      size: 10 + Math.random() * 14, opacity: 0.05 + Math.random() * 0.08,
      rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.006,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      blink: 0, blinkTimer: Math.random() * 200, mouthOpen: 0, earWiggle: 0,
    })
    floaters.push(f)
  }

  // ═══ 绘制函数 ═══

  function drawPaw(c, x, y, s, a) {
    c.save(); c.globalAlpha = a; c.fillStyle = '#f5a623'; c.translate(x, y)
    // 掌垫
    c.beginPath(); c.ellipse(0, s * 0.15, s * 0.42, s * 0.32, 0, 0, Math.PI * 2); c.fill()
    // 趾
    for (const [ox, oy, r] of [[-0.35, -0.2, 0.19], [-0.12, -0.4, 0.19], [0.12, -0.4, 0.19], [0.35, -0.2, 0.19]]) {
      c.beginPath(); c.ellipse(ox * s, oy * s, r * s, r * s * 0.85, 0, 0, Math.PI * 2); c.fill()
    }
    c.restore()
  }

  function drawCatHead(c, x, y, s, a, floater) {
    c.save(); c.globalAlpha = a; c.translate(x, y)

    // 耳朵 (带摆动)
    const earAngle = floater ? Math.sin(floater.life * 0.03) * 0.15 : 0
    c.fillStyle = '#f5a623'
    // 左耳
    c.save(); c.translate(-s * 0.35, -s * 0.45); c.rotate(-0.2 + earAngle)
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-s * 0.2, -s * 0.35); c.lineTo(s * 0.2, -s * 0.1); c.closePath(); c.fill()
    c.restore()
    // 右耳
    c.save(); c.translate(s * 0.35, -s * 0.45); c.rotate(0.2 - earAngle)
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-s * 0.2, -s * 0.1); c.lineTo(s * 0.2, -s * 0.35); c.closePath(); c.fill()
    c.restore()

    // 头
    c.beginPath(); c.arc(0, 0, s * 0.45, 0, Math.PI * 2); c.fill()

    // 眼睛 (带眨眼)
    const blinking = floater && floater.blink > 0
    c.fillStyle = '#333'
    if (blinking) {
      // 闭眼 — 一条线
      c.fillRect(-s * 0.22, -s * 0.08, s * 0.14, s * 0.03)
      c.fillRect(s * 0.08, -s * 0.08, s * 0.14, s * 0.03)
    } else {
      c.beginPath(); c.arc(-s * 0.15, -s * 0.08, s * 0.07, 0, Math.PI * 2); c.fill()
      c.beginPath(); c.arc(s * 0.15, -s * 0.08, s * 0.07, 0, Math.PI * 2); c.fill()
      // 高光
      c.fillStyle = '#fff'
      c.beginPath(); c.arc(-s * 0.12, -s * 0.11, s * 0.025, 0, Math.PI * 2); c.fill()
      c.beginPath(); c.arc(s * 0.18, -s * 0.11, s * 0.025, 0, Math.PI * 2); c.fill()
    }

    // 嘴
    c.strokeStyle = '#333'; c.lineWidth = s * 0.03; c.lineCap = 'round'
    const mouthOpen = floater ? floater.mouthOpen : 0
    if (mouthOpen > 0) {
      // 打哈欠
      c.fillStyle = '#e57373'
      c.beginPath(); c.ellipse(0, s * 0.18, s * 0.12 * mouthOpen, s * 0.08 * mouthOpen, 0, 0, Math.PI * 2); c.fill()
    } else {
      // 微笑
      c.beginPath(); c.moveTo(-s * 0.1, s * 0.12)
      c.quadraticCurveTo(-s * 0.05, s * 0.22, 0, s * 0.15)
      c.stroke()
      c.beginPath(); c.moveTo(0, s * 0.15)
      c.quadraticCurveTo(s * 0.05, s * 0.22, s * 0.1, s * 0.12)
      c.stroke()
    }

    // 胡须
    c.strokeStyle = '#bbb'; c.lineWidth = s * 0.015
    for (const side of [-1, 1]) {
      for (const angle of [-0.15, 0, 0.15]) {
        c.beginPath()
        c.moveTo(side * s * 0.2, s * 0.08)
        c.lineTo(side * s * 0.55, s * (0.05 + angle))
        c.stroke()
      }
    }

    // 鼻子
    c.fillStyle = '#e57373'
    c.beginPath(); c.moveTo(0, s * 0.02)
    c.lineTo(-s * 0.04, -s * 0.03); c.lineTo(s * 0.04, -s * 0.03); c.closePath(); c.fill()

    c.restore()
  }

  function drawFish(c, x, y, s, a) {
    c.save(); c.globalAlpha = a; c.fillStyle = '#ff8a65'; c.translate(x, y)
    c.beginPath(); c.ellipse(0, 0, s * 0.55, s * 0.28, 0, 0, Math.PI * 2); c.fill()
    c.beginPath(); c.moveTo(s * 0.45, 0); c.lineTo(s * 0.8, -s * 0.25); c.lineTo(s * 0.8, s * 0.25); c.closePath(); c.fill()
    c.fillStyle = '#333'; c.beginPath(); c.arc(-s * 0.2, -s * 0.04, s * 0.06, 0, Math.PI * 2); c.fill()
    c.restore()
  }

  function drawYarn(c, x, y, s, a) {
    c.save(); c.globalAlpha = a; c.translate(x, y)
    c.strokeStyle = '#e91e63'; c.lineWidth = s * 0.1; c.lineCap = 'round'
    c.beginPath(); c.arc(0, 0, s * 0.38, 0, Math.PI * 2); c.stroke()
    for (let i = -1; i <= 1; i++) {
      c.beginPath(); c.arc(i * s * 0.12, 0, s * 0.32, -0.7, 0.7); c.stroke()
    }
    c.beginPath(); c.moveTo(s * 0.32, s * 0.12)
    c.quadraticCurveTo(s * 0.55, s * 0.35, s * 0.45, s * 0.55); c.stroke()
    c.restore()
  }

  function drawStar(c, x, y, s, a) {
    c.save(); c.globalAlpha = a; c.fillStyle = '#ffd54f'; c.translate(x, y)
    c.beginPath()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? s * 0.4 : s * 0.18
      const ang = (i * Math.PI) / 5 - Math.PI / 2
      if (i === 0) c.moveTo(Math.cos(ang) * r, Math.sin(ang) * r)
      else c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r)
    }
    c.closePath(); c.fill(); c.restore()
  }

  const DRAW = { paw: drawPaw, cathead: drawCatHead, fish: drawFish, yarn: drawYarn, star: drawStar }

  // ═══ 鼠标轨迹 — 二次曲线猫爪 ═══
  function spawnTrail(x, y) {
    const colors = ['#f5a623', '#ff8a65', '#e91e63', '#ffd54f', '#81c784', '#64b5f6']
    trails.push({
      sx: x, sy: y,
      progress: 0,
      speed: 0.015 + Math.random() * 0.02,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      // 二次曲线参数: y = a*x² + b*x, 随机方向
      a: -(0.003 + Math.random() * 0.006),
      b: (Math.random() - 0.5) * 4,
      dir: Math.random() > 0.5 ? 1 : -1,
      type: Math.random() > 0.3 ? 'paw' : 'cathead', // 30% 概率是猫头
    })
  }

  // ═══ 主循环 ═══
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 浮动粒子
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i]
      f.x += f.vx; f.y += f.vy; f.rot += f.rotV; f.life++

      // 猫头眨眼逻辑
      if (f.type === 'cathead') {
        f.blinkTimer--
        if (f.blinkTimer <= 0 && f.blink <= 0) {
          f.blink = 12 // 眨眼持续帧数
          f.blinkTimer = 150 + Math.random() * 200
        }
        if (f.blink > 0) f.blink--
        // 偶尔打哈欠
        if (f.life % 400 === 0) f.mouthOpen = 1
        if (f.mouthOpen > 0) f.mouthOpen = Math.max(0, f.mouthOpen - 0.02)
      }

      // 淡入淡出
      const fadeIn = Math.min(f.life / 80, 1)
      const fadeOut = Math.max(1 - (f.life - f.max + 80) / 80, 0)
      const alpha = f.opacity * fadeIn * (f.life > f.max - 80 ? fadeOut : 1)

      if (f.life > f.max || f.y < -40) { floaters.splice(i, 1); continue }

      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot)
      DRAW[f.type](ctx, 0, 0, f.size, alpha, f)
      ctx.restore()
    }

    // 鼠标轨迹
    for (let i = trails.length - 1; i >= 0; i--) {
      const t = trails[i]
      t.progress += t.speed
      if (t.progress > 1) { trails.splice(i, 1); continue }

      const dx = t.progress * 80 * t.dir
      const dy = t.a * dx * dx + t.b * t.progress * 15
      const px = t.sx + dx
      const py = t.sy + dy - t.progress * 60
      const alpha = (1 - t.progress) * 0.6
      const s = t.size * (1 - t.progress * 0.4)

      if (t.type === 'paw') {
        ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = t.color
        // 掌垫
        ctx.beginPath(); ctx.ellipse(px, py + s * 0.1, s * 0.38, s * 0.28, 0, 0, Math.PI * 2); ctx.fill()
        // 两趾
        ctx.beginPath(); ctx.arc(px - s * 0.22, py - s * 0.12, s * 0.14, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(px + s * 0.22, py - s * 0.12, s * 0.14, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      } else {
        // 迷你猫头
        drawCatHead(ctx, px, py, s * 0.8, alpha, null)
      }
    }

    // 补充浮动粒子
    if (floaters.length < 15 && Math.random() < 0.02) spawnFloater()

    requestAnimationFrame(frame)
  }

  // ═══ 事件 ═══
  document.addEventListener('mousemove', (e) => {
    const now = Date.now()
    if (now - lastTrail < 60) return
    lastTrail = now
    spawnTrail(e.clientX, e.clientY)
  })

  // 启动
  requestAnimationFrame(frame)
})()
