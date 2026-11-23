'use strict'

const WORLD_W = 1000
const WORLD_H = 640
const POLL_MS = 400
const RETRY_MS = 2000
const SPEED = 170
const SAY_S = 12
const ERROR_S = 8
const FONT = '"Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", "Segoe UI", sans-serif'

const ROOMS = {
  library: { label: '자료실', en: 'LIBRARY', icon: '📚', note: '파일 읽기 · 검색', rect: [20, 20, 300, 190], floor: '#f4e8d6', door: [170, 210], side: 'bottom', node: 'a',
    slots: [[120, 132], [220, 132], [170, 180], [92, 182], [248, 182], [60, 132], [280, 132], [170, 96]] },
  meeting: { label: '회의실', en: 'MEETING', icon: '📋', note: '계획 · 할 일 · 스킬', rect: [340, 20, 280, 190], floor: '#e9edf8', door: [480, 210], side: 'bottom', node: 'c',
    slots: [[420, 84], [480, 84], [540, 84], [420, 160], [480, 160], [540, 160], [374, 122], [586, 122]] },
  dev: { label: '개발실', en: 'DEV', icon: '💻', note: '코드 작성 · 수정', rect: [640, 20, 340, 190], floor: '#e6f0f7', door: [810, 210], side: 'bottom', node: 'f',
    slots: [[700, 112], [770, 112], [840, 112], [910, 112], [700, 178], [770, 178], [840, 178], [910, 178]] },
  lounge: { label: '라운지', en: 'LOUNGE', icon: '🛋️', note: '30분 넘게 조용함', rect: [20, 260, 220, 170], floor: '#f7ede4', door: [240, 345], side: 'right', node: 'g',
    slots: [[120, 300], [170, 352], [120, 400], [190, 300], [200, 405], [80, 405]] },
  desk: { label: '내 자리', en: 'MY DESK', icon: '🙋', note: '질문 · 에이전트 호출 · 답변', rect: [360, 262, 280, 168], floor: '#e7eefc', door: [500, 262], side: 'top', node: 'c',
    slots: [[500, 356], [420, 376], [580, 376], [400, 330], [600, 330], [460, 410], [540, 410], [390, 410]] },
  server: { label: '서버실', en: 'SERVER', icon: '🖥️', note: '명령 실행 · git', rect: [760, 260, 220, 170], floor: '#e8e9ee', door: [760, 345], side: 'left', node: 'h',
    slots: [[800, 378], [850, 378], [900, 378], [950, 378], [825, 410], [875, 410], [925, 410], [950, 340]] },
  info: { label: '정보검색실', en: 'SEARCH', icon: '🌐', note: '웹 · 외부 도구', rect: [340, 480, 300, 140], floor: '#e3f3ec', door: [490, 480], side: 'top', node: 'j',
    slots: [[410, 580], [470, 566], [530, 580], [560, 526], [460, 520], [590, 596], [380, 540], [620, 506]] },
  elevator: { label: '엘리베이터', en: 'ELEVATOR', icon: '🛗', note: '서브에이전트 출퇴근', rect: [860, 480, 120, 140], floor: '#eceef2', door: [920, 480], side: 'top', node: 'l',
    slots: [[900, 588], [940, 588], [920, 604], [884, 604], [956, 604], [920, 572]] },
}
const PANTRY = { label: '탕비실', en: 'PANTRY', icon: '☕', rect: [20, 480, 300, 140], floor: '#f6efe6', door: [170, 480], side: 'top' }
const NODES = {
  a: [170, 235], b: [300, 235], c: [490, 235], e: [700, 235], f: [810, 235],
  g: [300, 345], h: [700, 345],
  i: [300, 455], j: [490, 455], k: [700, 455], l: [920, 455], m: [170, 455],
}
const EDGES = [['a', 'b'], ['b', 'c'], ['c', 'e'], ['e', 'f'], ['b', 'g'], ['g', 'i'], ['e', 'h'], ['h', 'k'], ['i', 'j'], ['j', 'k'], ['k', 'l'], ['i', 'm']]
const PLANTS = [[328, 248], [672, 248], [328, 462], [672, 462], [750, 560], [820, 600], [740, 500]]
const WIDE = {
  w: WORLD_W, h: WORLD_H, nodes: NODES, edges: EDGES, plants: PLANTS, spawn: [920, 596],
  rooms: Object.fromEntries(Object.entries(ROOMS).map(([key, room]) => [key, { ...room, shift: [0, 0] }])),
  pantry: { ...PANTRY, shift: [0, 0] },
}
const TALL = tallPlan({
  w: 692, h: 942, spine: 376, hall: 25,
  rooms: {
    dev: [20, 20, 160], library: [60, 228, 120], lounge: [140, 436, 85], info: [60, 624, 100],
    server: [392, 20, 85], meeting: [392, 228, 150], desk: [392, 436, 110], elevator: [392, 782, 60, 'top'],
  },
  pantry: [60, 782, 100],
  plants: [[40, 320], [80, 500], [642, 80], [642, 160], [480, 680], [610, 730], [590, 840], [645, 900]],
})
const INTERIORS = ['library', 'meeting', 'dev', 'lounge', 'desk', 'server', 'info', 'elevator']
const KIND_STYLES = {
  main: { body: '#d97757', hair: '#4a3426' },
  Explore: { body: '#3fa66b', hair: '#3a2b20', cap: '#2e7d4f' },
  Plan: { body: '#8a63d2', hair: '#2b2b35', glasses: true },
  'general-purpose': { body: '#4a7fd6', hair: '#3a2b20' },
  'code-reviewer': { body: '#2b9aa0', hair: '#5a4030', glasses: true },
  'web-fetch': { body: '#3aa3d9', hair: '#3a2b20', cap: '#1f6f99' },
}
const PALETTE = ['#e0864b', '#c2558f', '#5b8c3a', '#7a5bd1', '#2f8fbf', '#b5892f', '#cf5a5a', '#3f9f8f']
const STATUS_LABELS = { working: '작업 중', thinking: '고민 중', talking: '말하는 중', received: '요청 받음', waiting: '대기', leaving: '퇴근 중', resting: '쉬는 중' }
const LOG_ICONS = { agent: '🛗', say: '💬', error: '😓', prompt: '👤', done: '✅', notice: '🔔', stop: '⏹' }
const BUBBLE_TONES = {
  think: ['#ffffff', '#d9d3f5', '#5b48c9'],
  work: ['#ffffff', '#d5dce8', '#374151'],
  say: ['#fffdf7', '#ecd9b5', '#3b3b3b'],
  error: ['#fdecec', '#f0b4b4', '#b42323'],
  leave: ['#fff7e6', '#f2d39a', '#8a5a00'],
  rest: ['#f3f4f6', '#e2e5ea', '#6b7280'],
}

const ui = {
  canvas: document.getElementById('office'),
  wrap: document.getElementById('canvasWrap'),
  empty: document.getElementById('empty'),
  follow: document.getElementById('follow'),
  floorList: document.getElementById('floorList'),
  floorBadge: document.getElementById('floorBadge'),
  floorName: document.getElementById('floorName'),
  sessionTitle: document.getElementById('sessionTitle'),
  live: document.getElementById('live'),
  projectPath: document.getElementById('projectPath'),
  sessionId: document.getElementById('sessionId'),
  headcount: document.getElementById('headcount'),
  people: document.getElementById('people'),
  log: document.getElementById('log'),
  logCount: document.getElementById('logCount'),
  legend: document.getElementById('legend'),
  error: document.getElementById('error'),
}
const ctx = ui.canvas.getContext('2d')

let state = null
let clockOffset = 0
let follow = true
let selected = null
let expanded = null
let floorSig = ''
let logSig = ''
let currentSession = null
let placeDirect = true
let elevatorOpen = 0
let view = { dpr: 1, scale: 1, ox: 0, oy: 0, width: 0, height: 0 }
let plan = WIDE
let timer = 0
let inflight = false
let generation = 0
let lastFrame = performance.now()
const sprites = new Map()
const localSource = {
  interval: POLL_MS,
  retry: RETRY_MS,
  async state(session) {
    const query = session ? `?session=${encodeURIComponent(session)}` : ''
    const response = await fetch(`/api/state${query}`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
}
const source = window.officeSource ?? localSource

function el(tag, cls, text) {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (text !== undefined) node.textContent = text
  return node
}

function serverNow() {
  return Date.now() / 1000 + clockOffset
}

function ago(t, now) {
  const s = Math.max(0, now - t)
  if (s < 60) return '방금'
  if (s < 3600) return `${Math.floor(s / 60)}분 전`
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`
  return `${Math.floor(s / 86400)}일 전`
}

function span(sec) {
  const s = Math.max(0, Math.floor(sec))
  if (s < 60) return `${s}초`
  if (s < 3600) return `${Math.floor(s / 60)}분 ${s % 60}초`
  return `${Math.floor(s / 3600)}시간 ${Math.floor((s % 3600) / 60)}분`
}

function clock(t) {
  const d = new Date(t * 1000)
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':')
}

function modelName(raw) {
  const found = /(opus|sonnet|haiku|fable)-(\d+)(?:-(\d{1,2})(?!\d))?/i.exec(raw || '')
  if (!found) return raw || ''
  const family = found[1][0].toUpperCase() + found[1].slice(1).toLowerCase()
  return `${family} ${found[2]}${found[3] ? `.${found[3]}` : ''}${/\[1m\]/i.test(raw) ? ' (1M)' : ''}`
}

function hashIndex(text, size) {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.codePointAt(0)) >>> 0
  return h % size
}

function styleFor(actor) {
  if (actor.main) return KIND_STYLES.main
  if (KIND_STYLES[actor.kind]) return KIND_STYLES[actor.kind]
  const body = PALETTE[hashIndex(actor.kind || actor.id, PALETTE.length)]
  return { body, hair: '#3a2b20', glasses: hashIndex(actor.id, 3) === 0 }
}

function roomOf(key) {
  return ROOMS[key] ? key : 'desk'
}

function tallPlan(spec) {
  const place = (base, [x, y, door, wall]) => {
    const [bx, by, w, h] = base.rect
    const shift = [x - bx, y - by]
    const side = wall ?? (x + w <= spec.spine ? 'right' : 'left')
    return {
      ...base, shift, side, rect: [x, y, w, h], door: side === 'top' ? [x + door, y] : [side === 'right' ? x + w : x, y + door],
      slots: (base.slots ?? []).map(([sx, sy]) => [sx + shift[0], sy + shift[1]]),
    }
  }
  const rooms = Object.fromEntries(Object.entries(spec.rooms).map(([key, at]) => [key, { ...place(ROOMS[key], at), node: key }]))
  const nodes = {}
  const edges = []
  for (const [key, room] of Object.entries(rooms)) {
    const [dx, dy] = room.door
    if (room.side !== 'top') {
      nodes[key] = [spec.spine, dy]
      continue
    }
    nodes[key] = [dx, dy - spec.hall]
    nodes[`${key}-hall`] = [spec.spine, dy - spec.hall]
    edges.push([key, `${key}-hall`])
  }
  const order = Object.keys(nodes).filter(key => nodes[key][0] === spec.spine).sort((p, q) => nodes[p][1] - nodes[q][1])
  const [ex, ey] = rooms.elevator.shift
  return {
    w: spec.w, h: spec.h, rooms, nodes, plants: spec.plants, pantry: place(PANTRY, spec.pantry),
    edges: [...edges, ...order.slice(1).map((key, i) => [order[i], key])], spawn: [WIDE.spawn[0] + ex, WIDE.spawn[1] + ey],
  }
}

function replan(next) {
  plan = next
  for (const sprite of [...sprites.values()]) {
    if (sprite.gone || sprite.slot < 0) {
      sprites.delete(sprite.id)
      continue
    }
    const [x, y] = slotPos(sprite.room, sprite.slot)
    Object.assign(sprite, { x, y, path: [], moving: false, alpha: 1 })
  }
}

function slotPos(room, index) {
  const { slots, rect } = plan.rooms[room]
  if (index < slots.length) return slots[index]
  const [x, y, w, h] = rect
  const cols = Math.max(1, Math.floor((w - 40) / 28))
  const rows = Math.max(1, Math.floor((h - 60) / 30))
  const k = (index - slots.length) % (cols * rows)
  return [x + 34 + (k % cols) * 28, y + 55 + Math.floor(k / cols) * 30]
}

function shortest(from, to) {
  if (from === to) return [from]
  const dist = { [from]: 0 }
  const prev = {}
  const { nodes, edges } = plan
  const open = new Set(Object.keys(nodes))
  while (open.size) {
    let best = null
    for (const n of open) if (dist[n] !== undefined && (best === null || dist[n] < dist[best])) best = n
    if (best === null) break
    open.delete(best)
    if (best === to) break
    for (const [p, q] of edges) {
      const next = p === best ? q : q === best ? p : null
      if (!next || !open.has(next)) continue
      const d = dist[best] + Math.hypot(nodes[best][0] - nodes[next][0], nodes[best][1] - nodes[next][1])
      if (dist[next] === undefined || d < dist[next]) { dist[next] = d; prev[next] = best }
    }
  }
  const path = [to]
  while (path[0] !== from && prev[path[0]]) path.unshift(prev[path[0]])
  return path[0] === from ? path : [from, to]
}

function point(xy, anchor, door) {
  return { x: xy[0], y: xy[1], anchor, door }
}

function pathFrom(node, toRoom, target) {
  const to = plan.rooms[toRoom]
  return [...shortest(node, to.node).map(n => point(plan.nodes[n], n, null)), point(to.door, to.node, toRoom), point(target, null, null)]
}

function reroute(sprite, toRoom, target) {
  const next = sprite.path[0]
  if (next && next.door === toRoom) return [next, point(target, null, null)]
  if (next && next.anchor) return [next, ...pathFrom(next.anchor, toRoom, target)]
  if (sprite.room === toRoom) return [point(target, null, null)]
  const from = plan.rooms[sprite.room]
  return [point(from.door, from.node, sprite.room), ...pathFrom(from.node, toRoom, target)]
}

function syncActors(office) {
  if (!office) {
    sprites.clear()
    currentSession = null
    placeDirect = true
    return
  }
  if (office.sessionId !== currentSession) {
    sprites.clear()
    currentSession = office.sessionId
    placeDirect = true
  }
  const counts = {}
  const seen = new Set()
  for (const actor of office.actors) {
    const room = roomOf(actor.room)
    const index = counts[room] = (counts[room] ?? -1) + 1
    const target = slotPos(room, index)
    seen.add(actor.id)
    let sprite = sprites.get(actor.id)
    if (!sprite) {
      const direct = placeDirect || actor.main
      const spawn = direct ? target : plan.spawn
      sprite = { id: actor.id, x: spawn[0], y: spawn[1], path: [], room: direct ? room : 'elevator', slot: direct ? index : -1, alpha: direct ? 1 : 0, gone: false, moving: false, phase: Math.random() * 6 }
      sprites.set(actor.id, sprite)
    }
    sprite.data = actor
    sprite.gone = false
    if (sprite.room !== room || sprite.slot !== index) {
      sprite.path = reroute(sprite, room, target)
      sprite.room = room
      sprite.slot = index
    }
  }
  for (const sprite of sprites.values()) {
    if (seen.has(sprite.id) || sprite.gone) continue
    sprite.gone = true
    if (sprite.room !== 'elevator') {
      sprite.path = reroute(sprite, 'elevator', plan.spawn)
      sprite.room = 'elevator'
      sprite.slot = -1
    }
    sprite.data = { ...sprite.data, status: 'leaving', bubble: null }
  }
  placeDirect = false
}

function step(dt) {
  let busy = false
  const [ex, ey, ew] = plan.rooms.elevator.rect
  for (const sprite of [...sprites.values()]) {
    let budget = SPEED * dt
    while (budget > 0 && sprite.path.length) {
      const { x: tx, y: ty } = sprite.path[0]
      const dx = tx - sprite.x
      const dy = ty - sprite.y
      const d = Math.hypot(dx, dy)
      if (d <= budget) {
        sprite.x = tx
        sprite.y = ty
        sprite.path.shift()
        budget -= d
      } else {
        sprite.x += (dx / d) * budget
        sprite.y += (dy / d) * budget
        budget = 0
      }
    }
    sprite.moving = sprite.path.length > 0
    if (sprite.gone) {
      if (!sprite.moving) sprite.alpha -= dt * 1.5
      if (sprite.alpha <= 0) sprites.delete(sprite.id)
    } else {
      sprite.alpha = Math.min(1, sprite.alpha + dt * 2)
    }
    if (sprite.x > ex && sprite.x < ex + ew && sprite.y > ey - 10 && (sprite.moving || sprite.alpha < 1)) busy = true
  }
  elevatorOpen += ((busy ? 1 : 0) - elevatorOpen) * Math.min(1, dt * 6)
}

function rr(x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function circle(x, y, r, fill, stroke) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke() }
}

function box(x, y, w, h, fill, stroke, r = 3) {
  rr(x, y, w, h, r)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke() }
}

function drawShell(room) {
  const [x, y, w, h] = room.rect
  ctx.fillStyle = room.floor
  ctx.fillRect(x, y, w, h)
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.035)'
  ctx.lineWidth = 1
  for (let gx = x + 20; gx < x + w; gx += 20) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke() }
  for (let gy = y + 20; gy < y + h; gy += 20) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke() }
  ctx.restore()
  const gap = 24
  const [dx, dy] = room.door
  const sides = {
    top: [[x, y], [x + w, y]],
    bottom: [[x, y + h], [x + w, y + h]],
    left: [[x, y], [x, y + h]],
    right: [[x + w, y], [x + w, y + h]],
  }
  ctx.strokeStyle = '#b9c0cc'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  for (const [side, [[x1, y1], [x2, y2]]] of Object.entries(sides)) {
    ctx.beginPath()
    if (side === room.side) {
      if (y1 === y2) {
        ctx.moveTo(x1, y1); ctx.lineTo(dx - gap, y1)
        ctx.moveTo(dx + gap, y1); ctx.lineTo(x2, y2)
      } else {
        ctx.moveTo(x1, y1); ctx.lineTo(x1, dy - gap)
        ctx.moveTo(x1, dy + gap); ctx.lineTo(x2, y2)
      }
    } else {
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
    }
    ctx.stroke()
  }
}

function drawLabel(room) {
  const [x, y, w] = room.rect
  const title = `${room.icon} ${room.label}`
  ctx.font = `700 12px ${FONT}`
  const titleW = ctx.measureText(title).width
  ctx.font = `600 9px ${FONT}`
  const enW = w >= 200 ? ctx.measureText(room.en).width + 6 : 0
  box(x + 5, y + 5, titleW + enW + 12, 20, 'rgba(255, 255, 255, 0.88)', 'rgba(0, 0, 0, 0.06)', 7)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `700 12px ${FONT}`
  ctx.fillStyle = '#4b5563'
  ctx.fillText(title, x + 11, y + 19)
  if (enW) {
    ctx.font = `600 9px ${FONT}`
    ctx.fillStyle = '#9aa1ad'
    ctx.fillText(room.en, x + 17 + titleW, y + 19)
  }
}

function drawLibrary() {
  const books = ['#c0504d', '#4f81bd', '#9bbb59', '#f2c14e', '#8064a2', '#4bacc6', '#f79646']
  for (let i = 0; i < 4; i++) {
    const sx = 34 + i * 70
    box(sx, 30, 60, 26, '#a8754a', '#8c5f39', 2)
    for (let j = 0; j < 10; j++) {
      ctx.fillStyle = books[(i * 3 + j) % books.length]
      ctx.fillRect(sx + 3 + j * 5.5, 33, 4.3, 20)
    }
  }
  circle(170, 132, 24, '#e2c9a0', '#cfb184')
  for (const [cx, cy] of [[170, 100], [140, 132]]) circle(cx, cy, 6, '#9a6b4f')
}

function drawMeeting() {
  box(360, 30, 120, 12, '#ffffff', '#c9ced8', 2)
  ctx.strokeStyle = '#4f81bd'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(368, 36); ctx.lineTo(400, 36); ctx.moveTo(408, 36); ctx.lineTo(450, 36); ctx.stroke()
  box(400, 104, 160, 36, '#d6dbe6', '#bfc6d4', 6)
  for (let i = 0; i < 3; i++) {
    box(410 + i * 60, 92, 18, 9, '#5c6b8a')
    box(410 + i * 60, 143, 18, 9, '#5c6b8a')
  }
}

function drawDev(t) {
  for (const row of [60, 126]) {
    box(668, row, 290, 18, '#f7f8fa', '#cfd5df', 3)
    for (let i = 0; i < 4; i++) {
      const mx = 685 + i * 70
      box(mx, row - 8, 30, 14, '#2d3442', null, 2)
      ctx.fillStyle = (Math.floor(t * 2 + i + row) % 3 === 0) ? '#7fd3ff' : '#4c8fd9'
      ctx.fillRect(mx + 3, row - 5, 24, 8)
    }
  }
}

function drawLounge() {
  box(34, 290, 30, 100, '#8a5a44', '#6e4634', 8)
  box(64, 296, 8, 88, '#9c6a52', null, 3)
  box(90, 326, 50, 30, '#d9c2a5', '#bea582', 6)
  circle(115, 341, 5, '#f4f1ea', '#d9d2c5')
}

function drawDesk() {
  box(430, 300, 140, 34, '#f3f5f8', '#c6ccd6', 6)
  box(476, 288, 48, 22, '#2d3442', null, 3)
  ctx.fillStyle = '#f0b48f'
  ctx.fillRect(480, 291, 40, 16)
  ctx.font = `800 8px ${FONT}`
  ctx.fillStyle = '#7a3b1d'
  ctx.textAlign = 'center'
  ctx.fillText('Claude', 500, 302)
  box(440, 314, 30, 14, '#e3e7ee', '#c6ccd6', 2)
  box(530, 314, 30, 14, '#e3e7ee', '#c6ccd6', 2)
  rr(372, 274, 256, 146, 10)
  ctx.strokeStyle = 'rgba(70, 110, 200, 0.25)'
  ctx.setLineDash([5, 4])
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.setLineDash([])
}

function drawServer(t) {
  for (let i = 0; i < 4; i++) {
    const rx = 784 + i * 46
    box(rx, 284, 34, 62, '#2c3340', '#1c222c', 3)
    for (let k = 0; k < 5; k++) {
      const on = (Math.floor(t * 3 + i * 2 + k * 3) % 4) !== 0
      circle(rx + 8, 292 + k * 11, 1.8, on ? '#4ade80' : '#1f5135')
      circle(rx + 15, 292 + k * 11, 1.8, (k + Math.floor(t * 2)) % 3 === 0 ? '#60a5fa' : '#1e3a5f')
      ctx.fillStyle = '#3c4555'
      ctx.fillRect(rx + 20, 290 + k * 11, 10, 3)
    }
  }
}

function drawInfo(t) {
  for (const kx of [362, 600]) {
    box(kx, 500, 18, 42, '#8a63d2', '#6f4cb8', 4)
    ctx.fillStyle = '#d9ccff'
    ctx.fillRect(kx + 3, 505, 12, 14)
  }
  circle(560, 560, 15, '#4f9ad9', '#357ab8')
  ctx.fillStyle = '#6cc070'
  ctx.beginPath(); ctx.ellipse(556 + Math.sin(t) * 2, 555, 6, 4, 0.4, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(565 - Math.sin(t) * 2, 566, 4, 3, -0.3, 0, Math.PI * 2); ctx.fill()
  box(430, 596, 70, 14, '#f7f8fa', '#cfd5df', 3)
}

function drawElevator(floorText) {
  box(872, 504, 96, 66, '#d7dbe2', '#aeb5c1', 4)
  box(896, 507, 48, 13, '#1f2430', null, 3)
  ctx.font = `800 9px ${FONT}`
  ctx.fillStyle = '#fbbf24'
  ctx.textAlign = 'center'
  ctx.fillText(floorText, 920, 517)
  ctx.fillStyle = '#ffeec4'
  ctx.fillRect(874, 523, 92, 45)
  const doorW = Math.max(1, 46 * (1 - elevatorOpen))
  box(874, 523, doorW, 45, '#c3c9d3', '#9aa3b1', 1)
  box(966 - doorW, 523, doorW, 45, '#c3c9d3', '#9aa3b1', 1)
}

function drawPantry() {
  drawShell(plan.pantry)
  const [sx, sy] = plan.pantry.shift
  for (const [tx, ty] of [[80 + sx, 545 + sy], [170 + sx, 570 + sy], [260 + sx, 545 + sy]]) {
    circle(tx, ty, 14, '#e8c9a0', '#cfae82')
    circle(tx - 20, ty, 5, '#d98c4a')
    circle(tx + 20, ty, 5, '#d98c4a')
  }
}

function drawPlant(x, y) {
  circle(x, y + 6, 6, '#c9cfd8')
  circle(x - 5, y, 7, '#4caf6a')
  circle(x + 5, y - 2, 7, '#3d9a5a')
  circle(x, y - 7, 7, '#5cc27a')
}

function drawPerson(sprite, t) {
  const actor = sprite.data
  const style = styleFor(actor)
  const bob = sprite.moving ? Math.sin(t * 14 + sprite.phase) * 1.6 : 0
  const x = sprite.x
  const y = sprite.y + bob
  ctx.globalAlpha = Math.max(0, Math.min(1, sprite.alpha))
  ctx.fillStyle = 'rgba(20, 30, 50, 0.14)'
  ctx.beginPath(); ctx.ellipse(sprite.x, sprite.y + 2, 10, 3.5, 0, 0, Math.PI * 2); ctx.fill()
  const stride = sprite.moving ? Math.sin(t * 14 + sprite.phase) * 3 : 0
  ctx.fillStyle = '#3b4252'
  ctx.fillRect(x - 6, y - 4 + stride * 0.3, 4, 6)
  ctx.fillRect(x + 2, y - 4 - stride * 0.3, 4, 6)
  box(x - 9, y - 21, 18, 19, style.body, null, 6)
  if (actor.main) {
    ctx.font = `800 10px ${FONT}`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText('✳', x, y - 8)
  }
  circle(x, y - 29, 9, '#f6d7b8', '#e2b994')
  ctx.fillStyle = style.hair
  ctx.beginPath(); ctx.arc(x, y - 31, 9, Math.PI, 0); ctx.fill()
  if (style.cap) {
    ctx.fillStyle = style.cap
    ctx.beginPath(); ctx.arc(x, y - 32, 9.5, Math.PI, 0); ctx.fill()
    ctx.fillRect(x - 2, y - 33, 13, 3)
  }
  if (style.glasses) {
    ctx.strokeStyle = '#272b33'
    ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.arc(x - 3.6, y - 28, 2.6, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(x + 3.6, y - 28, 2.6, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x - 1, y - 28); ctx.lineTo(x + 1, y - 28); ctx.stroke()
  } else {
    circle(x - 3, y - 28, 1.3, '#272b33')
    circle(x + 3, y - 28, 1.3, '#272b33')
  }
  ctx.globalAlpha = 1
}

function drawTag(sprite) {
  const actor = sprite.data
  const style = styleFor(actor)
  ctx.globalAlpha = Math.max(0, Math.min(1, sprite.alpha))
  ctx.font = `700 10px ${FONT}`
  const name = clipText(actor.name, 120)
  const w = ctx.measureText(name).width + 20
  const x = Math.max(6, Math.min(plan.w - w - 6, sprite.x - w / 2))
  const y = sprite.y + 6
  box(x, y, w, 16, 'rgba(255, 255, 255, 0.92)', '#d9dee6', 8)
  circle(x + 8, y + 8, 3, style.body)
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(name, x + 14, y + 8.5)
  ctx.textBaseline = 'alphabetic'
  ctx.globalAlpha = 1
}

function clipText(text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text
  let out = ''
  for (const ch of text) {
    if (ctx.measureText(`${out}${ch}…`).width > maxW) break
    out += ch
  }
  return `${out}…`
}

function wrapText(text, maxW, maxLines) {
  const lines = []
  let line = ''
  const chars = [...text]
  for (let i = 0; i < chars.length; i++) {
    const next = line + chars[i]
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line)
      line = chars[i]
      if (lines.length === maxLines) {
        lines[maxLines - 1] = clipText(`${lines[maxLines - 1]}${chars.slice(i).join('')}`, maxW)
        return lines
      }
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function bubbleFor(actor, now, t) {
  const bubble = actor.bubble
  if (bubble && bubble.kind === 'error' && now - bubble.at < ERROR_S) return ['error', `😓 ${bubble.text}`, 1]
  if (bubble && bubble.kind === 'say' && (actor.status === 'talking' || actor.status === 'waiting') && now - bubble.at < SAY_S) {
    return ['say', `💬 ${bubble.text}`, actor.main ? 3 : 1]
  }
  switch (actor.status) {
    case 'thinking': return ['think', `💭 고민 중${'.'.repeat(1 + (Math.floor(t * 2) % 3))}  ${span(now - actor.since)}째`, 1]
    case 'working': return ['work', `${ROOMS[roomOf(actor.room)].icon} ${actor.detail}`, 1]
    case 'received': return ['work', '📨 요청 받음', 1]
    case 'leaving': return ['leave', '👋 퇴근합니다!', 1]
    case 'resting': return ['rest', '💤', 1]
    default: return null
  }
}

function drawBubble(sprite, now, t) {
  const found = bubbleFor(sprite.data, now, t)
  if (!found) return
  const [tone, text, maxLines] = found
  const [bg, border, color] = BUBBLE_TONES[tone]
  ctx.font = `600 11px ${FONT}`
  const maxW = sprite.data.main ? 240 : 170
  const lines = wrapText(text, maxW, maxLines)
  const w = Math.max(...lines.map(line => ctx.measureText(line).width)) + 16
  const h = lines.length * 15 + 9
  const x = Math.max(6, Math.min(plan.w - w - 6, sprite.x - w / 2))
  const y = Math.max(4, sprite.y - 48 - h)
  ctx.globalAlpha = Math.max(0, Math.min(1, sprite.alpha))
  rr(x, y, w, h, 8)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.strokeStyle = border
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(sprite.x - 5, y + h - 0.5)
  ctx.lineTo(sprite.x, y + h + 6)
  ctx.lineTo(sprite.x + 5, y + h - 0.5)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.strokeStyle = border
  ctx.beginPath(); ctx.moveTo(sprite.x - 5, y + h); ctx.lineTo(sprite.x, y + h + 6); ctx.lineTo(sprite.x + 5, y + h); ctx.stroke()
  ctx.fillStyle = color
  ctx.textAlign = 'left'
  lines.forEach((line, i) => ctx.fillText(line, x + 8, y + 16 + i * 15))
  ctx.globalAlpha = 1
}

function draw(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ui.canvas.width, ui.canvas.height)
  const s = view.dpr * view.scale
  ctx.setTransform(s, 0, 0, s, view.dpr * view.ox, view.dpr * view.oy)
  box(8, 8, plan.w - 16, plan.h - 16, '#f3f4f7', '#d5d9e0', 16)
  drawPantry()
  for (const room of Object.values(plan.rooms)) drawShell(room)
  const floorText = state?.office ? `▲ ${state.office.floor}F` : '▲ -'
  const paint = { library: drawLibrary, meeting: drawMeeting, dev: drawDev, lounge: drawLounge, desk: drawDesk, server: drawServer, info: drawInfo, elevator: () => drawElevator(floorText) }
  for (const key of INTERIORS) {
    const [sx, sy] = plan.rooms[key].shift
    if (!sx && !sy) {
      paint[key](t)
      continue
    }
    ctx.save()
    ctx.translate(sx, sy)
    paint[key](t)
    ctx.restore()
  }
  for (const [px, py] of plan.plants) drawPlant(px, py)
  drawLabel(plan.pantry)
  for (const room of Object.values(plan.rooms)) drawLabel(room)
  const ordered = [...sprites.values()].filter(sp => sp.data).sort((p, q) => p.y - q.y)
  for (const sprite of ordered) drawPerson(sprite, t)
  for (const sprite of ordered) drawTag(sprite)
  const now = serverNow()
  for (const sprite of ordered) drawBubble(sprite, now, t)
}

function frame(nowMs) {
  const dt = Math.min(0.1, (nowMs - lastFrame) / 1000)
  lastFrame = nowMs
  try {
    step(dt)
    draw(nowMs / 1000)
  } finally {
    requestAnimationFrame(frame)
  }
}

function layout() {
  const next = getComputedStyle(ui.wrap).getPropertyValue('--plan').trim() === 'tall' ? TALL : WIDE
  if (next !== plan) replan(next)
  const rect = ui.wrap.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  ui.canvas.width = Math.max(1, Math.round(rect.width * dpr))
  ui.canvas.height = Math.max(1, Math.round(rect.height * dpr))
  const scale = Math.min(rect.width / plan.w, rect.height / plan.h)
  view = { dpr, scale, ox: (rect.width - plan.w * scale) / 2, oy: (rect.height - plan.h * scale) / 2, width: rect.width, height: rect.height }
}

function renderHeader(office, now) {
  ui.floorBadge.textContent = office ? `${office.floor}F` : '-'
  ui.floorName.textContent = office ? office.floorName : '세션 없음'
  ui.sessionTitle.textContent = office ? office.title : ''
  ui.live.textContent = office ? (office.live ? '● LIVE' : `● ${ago(office.last, now)} 활동`) : '● 대기'
  ui.live.classList.toggle('on', Boolean(office && office.live))
  ui.projectPath.textContent = office ? office.path : '-'
  ui.projectPath.title = office ? office.path : ''
  ui.sessionId.textContent = office ? office.sessionId : '-'
  ui.empty.hidden = Boolean(office)
  document.title = office ? `${office.floor}F ${office.floorName} · Claude 사무실` : 'Claude 사무실'
}

function renderFloors(data, now) {
  const office = data.office
  const open = expanded === null ? office?.floorId ?? '' : expanded
  const sig = JSON.stringify([
    data.floors.map(f => [f.id, f.floor, f.name, f.count, f.active, ago(f.last, now), f.sessions.map(s => [s.id, s.title, s.active, ago(s.last, now)])]),
    office?.sessionId, open,
  ])
  if (sig === floorSig) return
  floorSig = sig
  ui.floorList.replaceChildren(...data.floors.map(floor => {
    const node = el('div', `floor${floor.id === office?.floorId ? ' current' : ''}${floor.active ? ' active' : ''}`)
    const row = el('button', 'floor-row')
    row.type = 'button'
    row.title = floor.path
    const meta = el('div', 'floor-meta')
    meta.append(el('b', '', floor.name), el('small', '', `세션 ${floor.count}개 · ${floor.active ? '지금 활동 중' : ago(floor.last, now)}`))
    row.append(el('span', 'floor-num', `${floor.floor}F`), meta, el('span', `dot${floor.active ? ' on' : ''}`))
    row.addEventListener('click', () => {
      expanded = open === floor.id ? '' : floor.id
      floorSig = ''
      renderFloors(state, serverNow())
    })
    node.append(row)
    if (open === floor.id) {
      const list = el('div', 'session-list')
      for (const session of floor.sessions) {
        const item = el('button', `session${session.id === office?.sessionId ? ' selected' : ''}`)
        item.type = 'button'
        item.title = session.title
        item.append(el('span', '', session.title), el('span', session.active ? 'now' : '', session.active ? '지금 활동 중' : ago(session.last, now)))
        item.addEventListener('click', () => {
          selected = session.id
          follow = false
          ui.follow.checked = false
          floorSig = ''
          pollNow()
        })
        list.append(item)
      }
      node.append(list)
    }
    return node
  }))
}

function personDetail(actor, now) {
  switch (actor.status) {
    case 'working': return `${ROOMS[roomOf(actor.room)].icon} ${ROOMS[roomOf(actor.room)].label} · ${actor.detail}`
    case 'thinking': return '💭 고민 중…'
    case 'talking': return `💬 ${actor.bubble?.text || '답변 작성 중'}`
    case 'received': return `📨 ${actor.detail || '요청 받음'}`
    case 'leaving': return '👋 퇴근합니다!'
    case 'resting': return '💤 30분 넘게 조용함'
    default: return actor.main ? '⌨️ 입력 기다리는 중' : '📝 보고 정리 중'
  }
}

function renderPeople(office, now) {
  const actors = office ? office.actors : []
  ui.headcount.textContent = `${actors.length}명 근무 중`
  ui.people.replaceChildren(...actors.map(actor => {
    const style = styleFor(actor)
    const node = el('div', 'person')
    const avatar = el('div', 'avatar', actor.main ? '✳' : (actor.kind || '?')[0].toUpperCase())
    avatar.style.background = style.body
    const body = el('div', 'person-body')
    const top = el('div', 'person-top')
    top.append(el('b', '', actor.name), el('small', '', actor.main ? modelName(actor.model) : actor.kind), el('span', `pill ${actor.status}`, STATUS_LABELS[actor.status] ?? actor.status))
    body.append(top, el('div', 'person-detail', personDetail(actor, now)), el('div', 'person-foot', `도구 ${actor.tools}회 · ${span(now - actor.since)}`))
    node.append(avatar, body)
    return node
  }))
}

function renderLog(office) {
  const entries = office ? office.log : []
  const sig = office ? `${office.sessionId}|${entries.map(entry => entry.id).join(',')}` : ''
  if (sig === logSig) return
  logSig = sig
  ui.logCount.textContent = entries.length ? `최근 ${entries.length}건` : ''
  ui.log.replaceChildren(...entries.map(entry => {
    const node = el('div', `entry kind-${entry.kind}`)
    const icon = entry.kind === 'tool' ? ROOMS[roomOf(entry.room)].icon : LOG_ICONS[entry.kind] ?? '•'
    node.append(el('time', '', clock(entry.t)), el('b', '', entry.who), el('span', '', `${icon} ${entry.text}`))
    return node
  }))
}

function renderLegend() {
  ui.legend.replaceChildren(...Object.values(ROOMS).map(room => {
    const node = el('div')
    node.append(el('b', '', `${room.icon} ${room.label}`), el('span', '', room.note))
    return node
  }))
}

function render(data) {
  const now = serverNow()
  ui.empty.textContent = data.notice || '표시할 세션이 없습니다'
  renderHeader(data.office, now)
  renderFloors(data, now)
  renderPeople(data.office, now)
  renderLog(data.office)
  syncActors(data.office)
}

function schedule(ms) {
  clearTimeout(timer)
  timer = setTimeout(poll, ms)
}

function pollNow() {
  generation += 1
  if (inflight) return
  clearTimeout(timer)
  poll()
}

async function poll() {
  if (inflight) return
  inflight = true
  const asked = generation
  let delay = source.interval
  try {
    const data = await source.state(!follow && selected ? selected : null)
    if (asked !== generation) {
      delay = 0
      return
    }
    clockOffset = data.now - Date.now() / 1000
    if (!follow && data.follow) {
      follow = true
      selected = null
      ui.follow.checked = true
    }
    state = data
    render(data)
    ui.error.hidden = true
  } catch (error) {
    if (asked !== generation) {
      delay = 0
      return
    }
    if (error.view) {
      state = error.view
      render(error.view)
    }
    if (state?.office?.live) renderHeader({ ...state.office, live: false }, serverNow())
    ui.error.textContent = error.userMessage ?? `서버에 연결할 수 없습니다 (${error.message}) · 다시 시도 중`
    ui.error.hidden = false
    delay = error.retryMs ?? source.retry
  } finally {
    inflight = false
    schedule(delay)
  }
}

ui.follow.addEventListener('change', () => {
  follow = ui.follow.checked
  if (follow) {
    selected = null
    expanded = null
  } else {
    selected = state?.office?.sessionId ?? null
  }
  floorSig = ''
  pollNow()
})

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) pollNow()
})
window.officeRefresh = pollNow

new ResizeObserver(layout).observe(ui.wrap)
layout()
renderLegend()
requestAnimationFrame(frame)
poll()
