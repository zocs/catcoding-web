/**
 * CatCoding — Cat Hunting Mouse Animation
 * Silhouette style: solid fill body + white contour lines
 * State machine: idle → stalking → pouncing → catching → victory
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

  let mouseX = canvas.width / 2, mouseY = canvas.height / 2, mouseOnPage = false

  // ═══ Color Palettes ═══
  const PALETTES = {
    orange: { fill: '#f5a623', dark: '#d4881a', light: '#ffb84d', outline: '#ffffff', eye: '#2d5a16', nose: '#e88888' },
    white:  { fill: '#e8e4de', dark: '#c8c4be', light: '#f5f2ed', outline: '#ffffff', eye: '#3a6ea5', nose: '#dda0a0' },
    black:  { fill: '#2a2a2e', dark: '#1a1a1e', light: '#3a3a3e', outline: '#ffffff', eye: '#ffd54f', nose: '#cc8888' },
  }

  // ═══ Main cat (interactive) ═══
  const cat = {
    x: 100, y: canvas.height - 120,
    state: 'idle', stateTimer: 0, facing: 1,
    size: 40, eyeOpen: 1, blinkTimer: 0,
    earAngle: 0, tailAngle: 0, crouch: 0,
    pounceCharge: 0, victoryDance: 0,
    breathPhase: 0, distToMouse: 999,
    caughtTimer: 0, homeX: 100, homeY: canvas.height - 120,
    palette: PALETTES.orange,
  }

  // ═══ Secondary cats (ambient) ═══
  const ambientCats = [
    {
      x: 0, y: 0, vx: 0.4 + Math.random() * 0.3, size: 28,
      palette: PALETTES.white, facing: 1, tailAngle: Math.random() * 6,
      walkPhase: Math.random() * 6, opacity: 0.35, eyeOpen: 1, blinkTimer: 200,
    },
    {
      x: canvas.width * 0.7, y: 0, vx: -(0.3 + Math.random() * 0.2), size: 22,
      palette: PALETTES.black, facing: -1, tailAngle: Math.random() * 6,
      walkPhase: Math.random() * 6, opacity: 0.25, eyeOpen: 1, blinkTimer: 300,
    },
  ]
  // Position at bottom
  ambientCats[0].y = canvas.height - 60
  ambientCats[1].y = canvas.height - 50

  // ═══ Background particles ═══
  const bgParticles = []
  for (let i = 0; i < 8; i++) {
    bgParticles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: 6 + Math.random() * 10, opacity: 0.04 + Math.random() * 0.06,
      vy: -(0.15 + Math.random() * 0.25), vx: (Math.random() - 0.5) * 0.2,
      type: ['paw', 'fish', 'star'][Math.floor(Math.random() * 3)],
      rot: Math.random() * 6.28, rotV: (Math.random() - 0.5) * 0.005,
    })
  }

  const victoryParticles = []

  // ═══ Drawing helpers ═══
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

  // ═══ Silhouette Cat Drawing ═══
  // One filled path body + white contour lines (banana reference style)
  function drawCatSilhouette(c, x, y, s, facing, crouch, breathe, tailAngle, eyeOpen, palette, state, pounceCharge) {
    c.save()
    c.translate(x, y)
    c.scale(facing, 1)

    const crouchY = crouch * s * 0.3
    const headY = -s * 0.28 + crouchY + breathe
    const { fill, dark, light, outline, eye, nose } = palette

    // ── Ground shadow ──
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.beginPath(); c.ellipse(0, s * 0.52, s * 0.4, s * 0.05, 0, 0, Math.PI * 2); c.fill()

    // ── Tail (filled stroke + white outline) ──
    const tw = Math.sin(tailAngle) * 0.3
    // outline
    c.strokeStyle = outline; c.lineWidth = s * 0.16; c.lineCap = 'round'; c.globalAlpha = 0.4
    c.beginPath(); c.moveTo(-s * 0.45, s * 0.05 + crouchY)
    c.bezierCurveTo(-s * 0.65, -s * 0.2 + tw * s, -s * 0.5, -s * 0.55, -s * 0.25, -s * 0.6)
    c.stroke()
    // fill
    c.strokeStyle = fill; c.lineWidth = s * 0.12; c.globalAlpha = 1
    c.beginPath(); c.moveTo(-s * 0.45, s * 0.05 + crouchY)
    c.bezierCurveTo(-s * 0.65, -s * 0.2 + tw * s, -s * 0.5, -s * 0.55, -s * 0.25, -s * 0.6)
    c.stroke()

    // ── BODY: single silhouette path ──
    // Head circle + body ellipse + ears, all in one path
    c.beginPath()

    // Body ellipse
    c.ellipse(0, s * 0.15 + crouchY, s * 0.48, s * 0.32, 0, 0, Math.PI * 2)

    // Head circle (merged)
    c.moveTo(s * 0.38, headY)
    c.arc(0, headY, s * 0.36, 0, Math.PI * 2)

    // Left ear (triangle, from outside to tip to inside)
    c.moveTo(-s * 0.28, headY - s * 0.28)
    c.lineTo(-s * 0.38, headY - s * 0.58)  // tip
    c.lineTo(-s * 0.12, headY - s * 0.32)
    c.closePath()

    // Right ear
    c.moveTo(s * 0.28, headY - s * 0.28)
    c.lineTo(s * 0.38, headY - s * 0.58)  // tip
    c.lineTo(s * 0.12, headY - s * 0.32)
    c.closePath()

    // Fill all shapes
    c.fillStyle = fill
    c.fill('evenodd')  // evenodd ensures ears cut out properly

    // ── White contour lines (the key style element) ──
    c.strokeStyle = outline; c.lineWidth = s * 0.028; c.lineCap = 'round'; c.lineJoin = 'round'
    c.globalAlpha = 0.55

    // Body contour
    c.beginPath(); c.ellipse(0, s * 0.15 + crouchY, s * 0.48, s * 0.32, 0, 0, Math.PI * 2); c.stroke()

    // Head contour
    c.beginPath(); c.arc(0, headY, s * 0.36, 0, Math.PI * 2); c.stroke()

    // Ear contours
    c.beginPath(); c.moveTo(-s * 0.28, headY - s * 0.28); c.lineTo(-s * 0.38, headY - s * 0.58); c.lineTo(-s * 0.12, headY - s * 0.32); c.stroke()
    c.beginPath(); c.moveTo(s * 0.28, headY - s * 0.28); c.lineTo(s * 0.38, headY - s * 0.58); c.lineTo(s * 0.12, headY - s * 0.32); c.stroke()

    // Tail contour
    c.beginPath(); c.moveTo(-s * 0.45, s * 0.05 + crouchY)
    c.bezierCurveTo(-s * 0.65, -s * 0.2 + tw * s, -s * 0.5, -s * 0.55, -s * 0.25, -s * 0.6)
    c.stroke()

    c.globalAlpha = 1

    // ── Paws (small ovals) ──
    const pawExt = state === 'pouncing' ? pounceCharge * s * 0.25 : 0
    for (const side of [-1, 1]) {
      const px = side * s * 0.28, py = s * 0.42 + crouchY + pawExt * 0.3
      // white outline
      c.strokeStyle = outline; c.lineWidth = s * 0.02; c.globalAlpha = 0.4
      c.beginPath(); c.ellipse(px, py, s * 0.09, s * 0.07, side * 0.15, 0, Math.PI * 2); c.stroke()
      // fill
      c.fillStyle = fill; c.globalAlpha = 1
      c.beginPath(); c.ellipse(px, py, s * 0.08, s * 0.06, side * 0.15, 0, Math.PI * 2); c.fill()
    }

    // ── Eyes (bright spots on silhouette) ──
    const eyeY = headY - s * 0.03, eyeSp = s * 0.14
    if (eyeOpen > 0.1) {
      for (const side of [-1, 1]) {
        const ex = side * eyeSp
        // Eye glow (bright ellipse on dark body)
        c.fillStyle = eye
        c.beginPath(); c.ellipse(ex, eyeY, s * 0.06 * eyeOpen, s * 0.05 * eyeOpen, 0, 0, Math.PI * 2); c.fill()
        // Pupil (white dot — silhouette style)
        c.fillStyle = '#fff'
        c.beginPath(); c.arc(ex + s * 0.01, eyeY - s * 0.01, s * 0.025 * eyeOpen, 0, Math.PI * 2); c.fill()
      }
    } else {
      // Closed eyes — white curved lines
      c.strokeStyle = outline; c.lineWidth = s * 0.02; c.lineCap = 'round'; c.globalAlpha = 0.6
      for (const side of [-1, 1]) {
        c.beginPath(); c.arc(side * eyeSp, eyeY, s * 0.045, 0.2, Math.PI - 0.2); c.stroke()
      }
      c.globalAlpha = 1
    }

    // ── Nose (small triangle) ──
    c.fillStyle = nose
    c.beginPath()
    c.moveTo(0, headY + s * 0.08)
    c.lineTo(-s * 0.025, headY + s * 0.05)
    c.lineTo(s * 0.025, headY + s * 0.05)
    c.closePath(); c.fill()

    // ── Whiskers (white lines) ──
    c.strokeStyle = outline; c.lineWidth = s * 0.012; c.lineCap = 'round'; c.globalAlpha = 0.45
    const wY = headY + s * 0.07
    for (const side of [-1, 1]) {
      for (let j = -1; j <= 1; j++) {
        c.beginPath()
        c.moveTo(side * s * 0.14, wY + j * s * 0.02)
        c.lineTo(side * s * 0.45, wY + j * s * 0.04 - s * 0.01)
        c.stroke()
      }
    }
    c.globalAlpha = 1

    c.restore()
  }

  // ═══ Main cat draw ═══
  function drawCat(c) {
    const breathe = Math.sin(cat.breathPhase) * 1.5
    drawCatSilhouette(c, cat.x, cat.y, cat.size, cat.facing, cat.crouch, breathe,
      cat.tailAngle, cat.eyeOpen, cat.palette, cat.state, cat.pounceCharge)
  }

  // ═══ Ambient cats ═══
  function updateAmbientCats() {
    for (const ac of ambientCats) {
      ac.x += ac.vx
      ac.tailAngle += 0.03
      ac.walkPhase += 0.05
      ac.blinkTimer--
      if (ac.blinkTimer <= 0) {
        ac.eyeOpen = ac.eyeOpen > 0.5 ? 0 : 1
        ac.blinkTimer = 150 + Math.random() * 250
      }
      // Wrap around screen
      if (ac.vx > 0 && ac.x > canvas.width + 60) { ac.x = -60; ac.facing = 1 }
      if (ac.vx < 0 && ac.x < -60) { ac.x = canvas.width + 60; ac.facing = -1 }
    }
  }

  function drawAmbientCats(c) {
    for (const ac of ambientCats) {
      c.save()
      c.globalAlpha = ac.opacity
      const walkBob = Math.sin(ac.walkPhase) * 2
      drawCatSilhouette(c, ac.x, ac.y + walkBob, ac.size, ac.facing, 0, 0,
        ac.tailAngle, ac.eyeOpen, ac.palette, 'idle', 0)
      c.restore()
    }
  }

  // ═══ Cursor ═══
  function drawCursor(c) {
    if (!mouseOnPage) return
    const isStalked = cat.state === 'stalking' || cat.state === 'pouncing'
    const s = 14
    c.save(); c.translate(mouseX, mouseY)
    if (isStalked) {
      const wiggle = Math.sin(Date.now() * 0.005) * 0.15
      c.rotate(wiggle)
      drawFishEmoji(c, 0, 0, s, 0.85)
    } else {
      const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.05
      c.scale(pulse, pulse); c.globalAlpha = 0.7
      c.strokeStyle = '#e91e63'; c.lineWidth = 2.5; c.lineCap = 'round'
      c.beginPath(); c.arc(0, 0, s * 0.5, 0, Math.PI * 2); c.stroke()
      for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(i * 4, 0, s * 0.42, -0.6, 0.6); c.stroke() }
      c.beginPath(); c.moveTo(s * 0.45, s * 0.1); c.quadraticCurveTo(s * 0.7, s * 0.4, s * 0.5, s * 0.6); c.stroke()
    }
    c.restore()
  }

  // ═══ State machine (unchanged logic) ═══
  function updateCat() {
    cat.stateTimer++
    cat.breathPhase += 0.04
    cat.tailAngle += 0.04
    cat.earAngle += 0.03

    const dx = mouseX - cat.x, dy = mouseY - cat.y
    cat.distToMouse = Math.sqrt(dx * dx + dy * dy)
    cat.facing = dx > 0 ? 1 : -1

    cat.blinkTimer--
    if (cat.blinkTimer <= 0) {
      cat.eyeOpen = 0
      if (cat.blinkTimer < -5) { cat.eyeOpen = 1; cat.blinkTimer = 120 + Math.random() * 200 }
    }

    switch (cat.state) {
      case 'idle':
        cat.crouch = 0
        cat.eyeOpen = Math.max(cat.eyeOpen, 0.8)
        if (mouseOnPage && cat.distToMouse < 400) { cat.state = 'stalking'; cat.stateTimer = 0 }
        cat.x += (cat.homeX - cat.x) * 0.01
        cat.y += (cat.homeY - cat.y) * 0.01
        break

      case 'stalking':
        cat.crouch = Math.min(cat.crouch + 0.02, 0.7)
        cat.eyeOpen = 1
        cat.x += (mouseX - cat.x) * 0.02
        cat.y += (mouseY - cat.y) * 0.02
        if (cat.distToMouse < 80) { cat.state = 'pouncing'; cat.stateTimer = 0; cat.pounceCharge = 0 }
        if (!mouseOnPage || cat.distToMouse > 600) { cat.state = 'idle'; cat.stateTimer = 0 }
        break

      case 'pouncing':
        cat.crouch = 1
        cat.pounceCharge = Math.min(cat.pounceCharge + 0.025, 1)
        if (cat.pounceCharge >= 1) { cat.state = 'catching'; cat.stateTimer = 0; cat.caughtTimer = 0 }
        break

      case 'catching':
        cat.crouch = Math.max(cat.crouch - 0.08, 0)
        cat.x += (mouseX - cat.x) * 0.15
        cat.y += (mouseY - cat.y) * 0.15
        if (cat.distToMouse < 25) {
          cat.caughtTimer++
          if (cat.caughtTimer > 120) {
            cat.state = 'victory'; cat.stateTimer = 0; cat.victoryDance = 0
            spawnVictoryBurst()
          }
        } else { cat.caughtTimer = Math.max(0, cat.caughtTimer - 2) }
        if (cat.stateTimer > 180) { cat.state = 'stalking'; cat.stateTimer = 0 }
        break

      case 'victory':
        cat.victoryDance += 0.08
        cat.y = cat.homeY + Math.abs(Math.sin(cat.victoryDance * 2)) * -15
        cat.x += Math.sin(cat.victoryDance * 3) * 1.5
        cat.crouch = 0; cat.eyeOpen = 1
        if (cat.stateTimer > 200) { cat.state = 'returning'; cat.stateTimer = 0 }
        break

      case 'returning':
        cat.crouch = 0
        cat.x += (cat.homeX - cat.x) * 0.03
        cat.y += (cat.homeY - cat.y) * 0.03
        if (Math.abs(cat.x - cat.homeX) < 5 && Math.abs(cat.y - cat.homeY) < 5) {
          cat.state = 'idle'; cat.stateTimer = 0
        }
        break
    }
  }

  // ═══ Victory particles ═══
  function spawnVictoryBurst() {
    const emojis = ['⭐', '🎉', '🐟', '✨', '🐾', '💛']
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.3
      const speed = 2 + Math.random() * 4
      victoryParticles.push({
        x: cat.x, y: cat.y - 20,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        life: 0, max: 60 + Math.random() * 30,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 12 + Math.random() * 10, rot: Math.random() * 6.28, rotV: (Math.random() - 0.5) * 0.1,
      })
    }
  }

  function updateVictoryParticles() {
    for (let i = victoryParticles.length - 1; i >= 0; i--) {
      const p = victoryParticles[i]
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++; p.rot += p.rotV
      if (p.life > p.max) { victoryParticles.splice(i, 1); continue }
      const alpha = 1 - p.life / p.max
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rot)
      ctx.font = `${p.size}px serif`; ctx.textAlign = 'center'; ctx.fillText(p.emoji, 0, 0)
      ctx.restore()
    }
  }

  // ═══ State label ═══
  function drawStateLabel(c) {
    const labels = { idle: '', stalking: '🐾 stalking...', pouncing: '⚡ charging...', catching: '💨 POUNCE!', victory: '🎉 caught!', returning: '🚶 returning...' }
    const label = labels[cat.state]
    if (!label) return
    c.save(); c.globalAlpha = 0.7
    c.font = '12px Inter, sans-serif'; c.fillStyle = cat.palette.fill; c.textAlign = 'center'
    c.fillText(label, cat.x, cat.y - cat.size - 8)
    c.restore()
  }

  // ═══ Main loop ═══
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background particles
    for (const p of bgParticles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV
      if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width }
      if (p.type === 'paw') drawPawPrint(ctx, p.x, p.y, p.size, p.opacity)
      else if (p.type === 'fish') drawFishEmoji(ctx, p.x, p.y, p.size, p.opacity)
      else { ctx.save(); ctx.globalAlpha = p.opacity; ctx.fillStyle = '#ffd54f'
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.restore() }
    }

    updateAmbientCats()
    drawAmbientCats(ctx)

    updateCat()
    drawCat(ctx)
    drawStateLabel(ctx)
    updateVictoryParticles()
    drawCursor(ctx)

    requestAnimationFrame(frame)
  }

  // ═══ Events ═══
  document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; mouseOnPage = true })
  document.addEventListener('mouseleave', () => { mouseOnPage = false })
  document.addEventListener('touchmove', (e) => { const t = e.touches[0]; mouseX = t.clientX; mouseY = t.clientY; mouseOnPage = true }, { passive: true })
  document.addEventListener('touchstart', (e) => { const t = e.touches[0]; mouseX = t.clientX; mouseY = t.clientY; mouseOnPage = true }, { passive: true })
  document.addEventListener('touchend', () => { mouseOnPage = false })

  requestAnimationFrame(frame)
})()
