'use strict'

const POLL_MS = 400
const RETRY_MS = 2000
const SPEED = 170
const SAY_S = 12
const ERROR_S = 8
const FONT = '"Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", "Segoe UI", sans-serif'
const CELL = 180
const ROAD = 32
const PITCH = CELL + ROAD
const TOP_PAD = 76
const MARGIN = 16
const BODY_H = 50
const GATE_AT = 148
const GATE_W = 36
const SPAWN = [80, 80]
const GHOST = 0.5
const COMPACT_W = 640
const GRASS = '#93cf6f'
const WALL_T = 6
const WALL_H = 64
const STUB_H = 10
const REACH = 9
const SEAT_FAR = PITCH - WALL_H - 8
const CUT = '#fffaf0'

const ROOMS = {
  library: { label: '대도서관', en: 'GRAND LIBRARY', icon: '📜', note: '파일 읽기 · 검색', gate: 'right', floor: '#c9965c', wall: '#efe2c4' },
  meeting: { label: '작전지휘소', en: 'WAR ROOM', icon: '🗺️', note: '계획 · 할 일 · 스킬', gate: 'right', floor: '#cdb084', wall: '#f1e4c8' },
  dev: { label: '대장간', en: 'FORGE', icon: '⚒️', note: '코드 작성 · 수정', gate: 'right', floor: '#8e877c', wall: '#a89e8f' },
  lounge: { label: '주점', en: 'TAVERN', icon: '🍺', note: '30분 넘게 조용함', gate: 'bottom', floor: '#a9743f', wall: '#ecd8b0' },
  desk: { label: '타운홀', en: 'TOWN HALL', icon: '🏛️', note: '질문 · 에이전트 호출 · 답변', gate: 'bottom', floor: '#e8e0cc', wall: '#f3ead2' },
  server: { label: '무기고', en: 'ARMORY', icon: '⚔️', note: '명령 실행 · git', gate: 'bottom', floor: '#9b968c', wall: '#a7a297' },
  info: { label: '정찰소', en: 'SCOUT POST', icon: '🔭', note: '웹 · 외부 도구', gate: 'bottom', floor: '#bb8f5c', wall: '#ead9b2' },
  elevator: { label: '차원 포탈', en: 'PORTAL', icon: '🌀', note: '서브에이전트 소환 · 귀환', gate: 'right', floor: '#7e8099', wall: '#77788f' },
}
const PLAZA = { label: '광장', en: 'PLAZA', icon: '⛲', note: '마을 한가운데 쉼터' }
const FURNITURE = {
  library: [[6, 22, 20, 118, 'shelfL'], [24, 6, 138, 20, 'shelfR'], [150, 6, 166, 22, 'plant'], [6, 128, 22, 144, 'plant'], [72, 70, 112, 98, 'readingTable'], [132, 40, 146, 54, 'globe']],
  meeting: [[6, 6, 22, 22, 'plant'], [58, 58, 118, 102, 'mapTable'], [144, 24, 152, 32, 'flagStand']],
  dev: [[6, 6, 50, 50, 'hearth'], [6, 70, 22, 136, 'workbench'], [150, 6, 168, 20, 'woodpile'], [88, 70, 108, 82, 'anvil'], [132, 28, 146, 42, 'quench']],
  lounge: [[6, 6, 30, 30, 'barrels'], [40, 6, 148, 30, 'counter'], [152, 6, 168, 22, 'plant'], [6, 66, 18, 110, 'fireplace'], [56, 98, 80, 122, 'roundTable'], [104, 66, 128, 90, 'roundTable']],
  desk: [[130, 6, 160, 18, 'cabinet'], [6, 96, 20, 132, 'waitBench'], [6, 146, 20, 160, 'plant'], [6, 6, 20, 20, 'plant'], [56, 44, 112, 62, 'clerkDesk']],
  server: [[24, 6, 128, 18, 'weaponRack'], [6, 120, 24, 156, 'crates'], [50, 66, 72, 80, 'chest'], [100, 92, 112, 104, 'dummy'], [140, 40, 152, 52, 'armorStand']],
  info: [[28, 6, 60, 22, 'coop'], [6, 140, 22, 156, 'plant'], [34, 46, 50, 62, 'telescope'], [118, 38, 150, 54, 'writingDesk'], [98, 94, 112, 108, 'crystal']],
  elevator: [[140, 6, 152, 18, 'menhir'], [6, 140, 18, 152, 'menhir'], [22, 22, 58, 58, 'portal']],
}
const STATIONS = {
  library: [[92, 112, 1], [56, 36, 1], [34, 62, -1], [126, 84, -1], [104, 36, 1], [34, 100, -1], [140, 68, 1], [58, 118, 1]],
  meeting: [[88, 116, 1], [132, 80, -1], [44, 80, 1], [88, 44, -1], [132, 116, -1], [44, 116, 1], [128, 44, -1], [44, 44, 1]],
  dev: [[98, 96, 1], [66, 66, 1], [36, 104, -1], [122, 76, -1], [140, 58, 1], [70, 124, 1], [110, 124, 1], [140, 100, -1]],
  lounge: [[68, 136, 1], [116, 104, 1], [70, 46, 1], [34, 88, -1], [92, 110, -1], [138, 78, -1], [112, 46, 1], [42, 132, 1]],
  desk: [[84, 30, 1], [84, 76, 1], [126, 52, -1], [34, 62, -1], [104, 106, 1], [60, 112, 1], [136, 96, -1], [100, 140, 1]],
  server: [[76, 34, 1], [106, 120, 1], [34, 60, -1], [118, 34, 1], [60, 96, 1], [128, 96, -1], [140, 70, 1], [36, 104, -1]],
  info: [[64, 54, -1], [105, 124, 1], [134, 70, 1], [76, 36, -1], [126, 100, -1], [36, 96, -1], [70, 120, 1], [140, 114, -1]],
  elevator: [[116, 62, -1], [62, 116, 1], [118, 118, 1], [146, 84, -1], [84, 146, 1], [144, 144, 1], [146, 40, -1], [40, 146, 1]],
}
const KIND_STYLES = {
  main: { body: '#d97757', hair: '#4a3426', gear: 'crown' },
  Explore: { body: '#3fa66b', hair: '#3a2b20', gear: 'hood', cap: '#2e7d4f' },
  Plan: { body: '#8a63d2', hair: '#2b2b35', gear: 'wizard', glasses: true, cap: '#5b3fa8' },
  'general-purpose': { body: '#4a7fd6', hair: '#3a2b20', gear: 'helm' },
  'code-reviewer': { body: '#2b9aa0', hair: '#5a4030', gear: 'scholar', glasses: true, cap: '#24324a' },
  'web-fetch': { body: '#3aa3d9', hair: '#3a2b20', gear: 'feather', cap: '#1f6f99' },
}
const GEARS = ['hood', 'wizard', 'helm', 'feather', 'scholar']
const PALETTE = ['#e0864b', '#c2558f', '#5b8c3a', '#7a5bd1', '#2f8fbf', '#b5892f', '#cf5a5a', '#3f9f8f']
const STATUS_LABELS = { working: '작업 중', thinking: '고민 중', talking: '말하는 중', received: '요청 받음', waiting: '대기', leaving: '귀환 중', resting: '쉬는 중' }
const STATUS_TONES = {
  working: ['#e6f0ff', '#2f62c9'], thinking: ['#f0ebff', '#6b4fd0'], talking: ['#fff1e6', '#b8642f'], received: ['#e6f0ff', '#2f62c9'],
  waiting: ['#eef0f4', '#5b6474'], leaving: ['#fdf0d9', '#9a6a14'], resting: ['#eef0f4', '#8a93a3'],
}
const ACTIVE = new Set(['working', 'thinking', 'talking', 'received'])
const LOG_ICONS = { agent: '🌀', say: '💬', error: '😓', prompt: '👤', done: '✅', notice: '🔔', stop: '⏹' }
const BUBBLE_TONES = {
  say: ['#fffdf7', '#ecd9b5', '#3b3b3b'],
  error: ['#fdecec', '#f0b4b4', '#b42323'],
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
let ctx = ui.canvas.getContext('2d')

let state = null
let clockOffset = 0
let follow = true
let selected = null
let expanded = null
let floorSig = ''
let logSig = ''
let currentSession = null
let placeDirect = true
let portalPower = 0
let view = { dpr: 1, scale: 1, ox: 0, oy: 0, width: 0, height: 0 }
let timer = 0
let inflight = false
let generation = 0
let lastFrame = performance.now()
let hover = null
let pointer = null
let ground = null
let lastOrder = []
let lastGhosts = []
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
  return { body, hair: '#3a2b20', glasses: hashIndex(actor.id, 3) === 0, gear: GEARS[hashIndex(actor.kind || actor.id, GEARS.length)], cap: body }
}

function roomOf(key) {
  return ROOMS[key] ? key : 'desk'
}

function project(x, y, z = 0) {
  return [x - y, (x + y) / 2 - z]
}

function unproject(sx, sy) {
  return [sy + sx / 2, sy - sx / 2]
}

function cellOrigin([i, j]) {
  return [i * PITCH + ROAD / 2, j * PITCH + ROAD / 2]
}

function gatePoint(gate) {
  return gate === 'right' ? [CELL, GATE_AT] : [GATE_AT, CELL]
}

function entryPoint(gate) {
  return gate === 'right' ? [CELL - 16, GATE_AT] : [GATE_AT, CELL - 16]
}

function faceTo(u, v, [fu, fv]) {
  return (fu - u) - (fv - v) < 0 ? -1 : 1
}

function grown([u0, v0, u1, v1], pad) {
  return [u0 - pad, v0 - pad, u1 + pad, v1 + pad]
}

function within([u0, v0, u1, v1], u, v) {
  return u > u0 && u < u1 && v > v0 && v < v1
}

function roomSlots(key) {
  const stations = STATIONS[key]
  const boxes = FURNITURE[key].map(b => grown(b, REACH + 5))
  const avoid = key === 'elevator' ? [entryPoint(ROOMS[key].gate), SPAWN] : [entryPoint(ROOMS[key].gate)]
  const focus = [0, 1].map(i => stations.reduce((sum, s) => sum + s[i], 0) / stations.length)
  const taken = stations.map(([u, v]) => [u, v])
  const extra = []
  for (let u = 18; u <= SEAT_FAR; u += 20) {
    for (let v = 18; v <= SEAT_FAR; v += 20) {
      if (boxes.some(b => within(b, u, v))) continue
      if (taken.some(([a, b]) => Math.hypot(u - a, v - b) < 20)) continue
      if (avoid.some(([a, b]) => Math.hypot(u - a, v - b) < 26)) continue
      taken.push([u, v])
      extra.push([u, v, faceTo(u, v, focus)])
    }
  }
  const near = ([u, v]) => Math.hypot(u - focus[0], v - focus[1])
  extra.sort((p, q) => near(p) - near(q))
  return [...stations, ...extra]
}

function prismHull([u0, v0, u1, v1], h, [ox, oy]) {
  return [[u0, v0, h], [u1, v0, h], [u1, v0, 0], [u1, v1, 0], [u0, v1, 0], [u0, v1, h]].map(([u, v, z]) => project(ox + u, oy + v, z))
}

function insideHull(hull, x, y) {
  let sign = 0
  for (let i = 0; i < hull.length; i++) {
    const [ax, ay] = hull[i]
    const [bx, by] = hull[(i + 1) % hull.length]
    const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax)
    if (Math.abs(cross) < 1e-9) continue
    if (sign && Math.sign(cross) !== sign) return false
    sign = Math.sign(cross)
  }
  return true
}

const BACK_WALLS = [[0, 0, WALL_T, CELL], [WALL_T, 0, CELL, WALL_T]]

function cornersOf(room) {
  const [ox, oy] = room.origin
  const lo = 14
  const hi = CELL - 14
  const out = []
  for (const [x0, y0, x1, y1] of room.blocks) {
    for (const [x, y] of [[x0 - 1, y0 - 1], [x1 + 1, y0 - 1], [x1 + 1, y1 + 1], [x0 - 1, y1 + 1]]) {
      if (x < ox + lo || x > ox + hi || y < oy + lo || y > oy + hi) continue
      if (room.blocks.some(b => within(b, x, y))) continue
      out.push([x, y])
    }
  }
  return out
}

function buildPlan(id, cells) {
  const used = new Set(Object.values(cells).map(([i, j]) => `${i},${j}`))
  const has = (i, j) => used.has(`${i},${j}`)
  const rooms = {}
  const doorNodes = {}
  for (const [key, cell] of Object.entries(cells)) {
    if (key === 'plaza') continue
    const base = ROOMS[key]
    const origin = cellOrigin(cell)
    const [ox, oy] = origin
    const [gu, gv] = gatePoint(base.gate)
    const door = [ox + gu, oy + gv]
    doorNodes[key] = base.gate === 'right' ? [door[0] + ROAD / 2, door[1]] : [door[0], door[1] + ROAD / 2]
    const [eu, ev] = entryPoint(base.gate)
    const slots = roomSlots(key)
    rooms[key] = {
      ...base, key, cell, origin, rect: [ox, oy, CELL, CELL], door, node: key, side: base.gate,
      entry: [ox + eu, oy + ev],
      slots: slots.map(([u, v]) => [ox + u, oy + v]),
      faces: slots.map(s => s[2]),
      hulls: BACK_WALLS.map(b => prismHull(b, WALL_H, origin)),
      blocks: FURNITURE[key].map(b => {
        const [u0, v0, u1, v1] = grown(b, REACH)
        return [ox + u0, oy + v0, ox + u1, oy + v1]
      }),
    }
    rooms[key].corners = cornersOf(rooms[key])
  }
  const plazaOrigin = cellOrigin(cells.plaza)
  const plaza = { ...PLAZA, key: 'plaza', cell: cells.plaza, origin: plazaOrigin, rect: [plazaOrigin[0], plazaOrigin[1], CELL, CELL] }
  const list = Object.values(cells)
  const maxI = Math.max(...list.map(c => c[0])) + 1
  const maxJ = Math.max(...list.map(c => c[1])) + 1
  const segments = []
  for (let k = 0; k <= maxI; k++) {
    for (let l = 0; l < maxJ; l++) {
      if (has(k - 1, l) || has(k, l)) segments.push({ along: 1, at: k * PITCH, from: l * PITCH, to: (l + 1) * PITCH, a: `x${k}y${l}`, b: `x${k}y${l + 1}` })
    }
  }
  for (let l = 0; l <= maxJ; l++) {
    for (let k = 0; k < maxI; k++) {
      if (has(k, l - 1) || has(k, l)) segments.push({ along: 0, at: l * PITCH, from: k * PITCH, to: (k + 1) * PITCH, a: `x${k}y${l}`, b: `x${k + 1}y${l}` })
    }
  }
  const nodes = {}
  const edges = []
  for (const seg of segments) {
    const at = (t) => (seg.along === 1 ? [seg.at, t] : [t, seg.at])
    nodes[seg.a] = at(seg.from)
    nodes[seg.b] = at(seg.to)
    const stops = [seg.a, seg.b]
    for (const [key, xy] of Object.entries(doorNodes)) {
      if (xy[1 - seg.along] === seg.at && xy[seg.along] > seg.from && xy[seg.along] < seg.to) {
        nodes[key] = xy
        stops.push(key)
      }
    }
    stops.sort((p, q) => nodes[p][seg.along] - nodes[q][seg.along])
    stops.slice(1).forEach((n, i) => edges.push([stops[i], n]))
  }
  const squares = list.map(([i, j]) => [i * PITCH - ROAD / 2, j * PITCH - ROAD / 2, (i + 1) * PITCH + ROAD / 2, (j + 1) * PITCH + ROAD / 2])
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [ax, ay, bx, by] of squares) {
    for (const [x, y] of [[ax, ay], [bx, ay], [bx, by], [ax, by]]) {
      const [sx, sy] = project(x, y)
      minX = Math.min(minX, sx)
      maxX = Math.max(maxX, sx)
      minY = Math.min(minY, sy)
      maxY = Math.max(maxY, sy)
    }
  }
  for (const cell of list) {
    const [ox, oy] = cellOrigin(cell)
    minY = Math.min(minY, (ox + oy) / 2 - TOP_PAD)
  }
  const elevator = rooms.elevator.origin
  const p = {
    id, rooms, plaza, nodes, edges, squares, segments,
    spawn: [elevator[0] + SPAWN[0], elevator[1] + SPAWN[1]],
    x0: minX - MARGIN, y0: minY - MARGIN, w: maxX - minX + 2 * MARGIN, h: maxY - minY + 2 * MARGIN,
  }
  p.trees = plantTrees(p)
  return p
}

function plantTrees(p) {
  const trees = []
  const inSquare = (x, y) => p.squares.some(([ax, ay, bx, by]) => x > ax - 4 && x < bx + 4 && y > ay - 4 && y < by + 4)
  const [gx0, gy0] = [p.y0 + p.x0 / 2, p.y0 - (p.x0 + p.w) / 2]
  const [gx1, gy1] = [p.y0 + p.h + (p.x0 + p.w) / 2, p.y0 + p.h - p.x0 / 2]
  const step = 44
  for (let gx = gx0; gx <= gx1; gx += step) {
    for (let gy = gy0; gy <= gy1; gy += step) {
      const seed = hashIndex(`${Math.round(gx)}:${Math.round(gy)}`, 1000003)
      const x = gx + ((seed % 29) - 14)
      const y = gy + ((Math.floor(seed / 29) % 29) - 14)
      const r = 13 + (seed % 7)
      const [sx, sy] = project(x, y)
      const top = sy - 14 - r * 2
      if (sx - r < p.x0 + 2 || sx + r > p.x0 + p.w - 2 || top < p.y0 + 2 || sy + 5 > p.y0 + p.h - 2) continue
      let clear = true
      for (let i = 0; i <= 4 && clear; i++) {
        for (let k = 0; k <= 4 && clear; k++) {
          const px = sx - r + (2 * r * i) / 4
          const py = top + ((sy + 5 - top) * k) / 4
          for (const dz of [0, 16, 32, 48, WALL_H]) {
            const [ux, uy] = unproject(px, py + dz)
            if (inSquare(ux, uy)) { clear = false; break }
          }
        }
      }
      if (!clear || trees.some(([tx, ty]) => Math.hypot(tx - x, ty - y) < 30)) continue
      trees.push([x, y, r, seed])
    }
  }
  return trees.sort((a, b) => a[0] + a[1] - b[0] - b[1])
}

const WIDE = buildPlan('wide', { library: [0, 0], info: [0, 1], server: [1, 0], dev: [0, 2], desk: [1, 1], meeting: [2, 0], lounge: [1, 2], plaza: [2, 1], elevator: [2, 2] })
const TALL = buildPlan('tall', { library: [0, 0], info: [0, 1], server: [1, 0], desk: [1, 1], dev: [1, 2], meeting: [2, 1], plaza: [2, 2], lounge: [2, 3], elevator: [3, 2] })
let plan = WIDE

function camera(p, width, height, dpr = 1) {
  const scale = Math.max(1e-6, Math.min(width / p.w, height / p.h))
  return { dpr, scale, ox: (width - p.w * scale) / 2 - p.x0 * scale, oy: (height - p.h * scale) / 2 - p.y0 * scale, width, height }
}

function toScreen(cam, x, y, z = 0) {
  const [px, py] = project(x, y, z)
  return [px * cam.scale + cam.ox, py * cam.scale + cam.oy]
}

function replan(next) {
  plan = next
  ground = null
  for (const sprite of [...sprites.values()]) {
    if (sprite.gone || sprite.slot < 0) {
      sprites.delete(sprite.id)
      continue
    }
    const [x, y] = slotPos(sprite.room, sprite.slot)
    Object.assign(sprite, { x, y, path: [], moving: false, alpha: 1, face: slotFace(sprite.room, sprite.slot) })
  }
}

function slotPos(room, index) {
  const { slots } = plan.rooms[room]
  return slots[index % slots.length]
}

function slotFace(room, index) {
  const { faces } = plan.rooms[room]
  return faces[index % faces.length]
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

function point(xy, anchor = null, door = null) {
  return { x: xy[0], y: xy[1], anchor, door }
}

function blocked(a, b, blocks) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  return blocks.some(([x0, y0, x1, y1]) => {
    let t0 = 0
    let t1 = 1
    for (const [p, q] of [[-dx, a[0] - x0], [dx, x1 - a[0]], [-dy, a[1] - y0], [dy, y1 - a[1]]]) {
      if (Math.abs(p) < 1e-9) {
        if (q <= 0) return false
        continue
      }
      const r = q / p
      if (p < 0) t0 = Math.max(t0, r)
      else t1 = Math.min(t1, r)
    }
    return t0 < t1 - 1e-9
  })
}

function inner(key, from, to) {
  const room = plan.rooms[key]
  if (!blocked(from, to, room.blocks)) return [point(to)]
  const pts = [from, to, ...room.corners]
  const dist = pts.map(() => Infinity)
  const prev = pts.map(() => -1)
  const done = pts.map(() => false)
  dist[0] = 0
  for (;;) {
    let best = -1
    for (let i = 0; i < pts.length; i++) if (!done[i] && dist[i] < Infinity && (best < 0 || dist[i] < dist[best])) best = i
    if (best < 0 || best === 1) break
    done[best] = true
    for (let i = 0; i < pts.length; i++) {
      if (done[i]) continue
      const d = dist[best] + Math.hypot(pts[i][0] - pts[best][0], pts[i][1] - pts[best][1])
      if (d < dist[i] && !blocked(pts[best], pts[i], room.blocks)) {
        dist[i] = d
        prev[i] = best
      }
    }
  }
  if (dist[1] === Infinity) return [point(to)]
  const out = []
  for (let i = 1; i > 0; i = prev[i]) out.unshift(point(pts[i]))
  return out
}

function enter(key, target) {
  const room = plan.rooms[key]
  return [point(room.entry), ...inner(key, room.entry, target)]
}

function pathFrom(node, toRoom, target) {
  const to = plan.rooms[toRoom]
  return [...shortest(node, to.node).map(n => point(plan.nodes[n], n)), point(to.door, to.node, toRoom), ...enter(toRoom, target)]
}

function where(x, y) {
  for (const room of Object.values(plan.rooms)) {
    const [rx, ry, rw, rh] = room.rect
    if (x >= rx - 0.5 && x <= rx + rw + 0.5 && y >= ry - 0.5 && y <= ry + rh + 0.5) return room.key
  }
  return null
}

function nearestNode(x, y) {
  let best = null
  for (const [key, [nx, ny]] of Object.entries(plan.nodes)) {
    const d = Math.hypot(nx - x, ny - y)
    if (!best || d < best[1]) best = [key, d]
  }
  return best[0]
}

function reroute(sprite, toRoom, target) {
  const pos = [sprite.x, sprite.y]
  const here = where(...pos)
  const next = sprite.path[0]
  if (here === toRoom) return inner(here, pos, target)
  if (next && next.door === toRoom) return [next, ...enter(toRoom, target)]
  if (next && next.anchor) {
    const rest = pathFrom(next.anchor, toRoom, target)
    return next.door && next.door !== here ? rest : [next, ...rest]
  }
  if (here) {
    const from = plan.rooms[here]
    return [...inner(here, pos, from.entry), point(from.door, from.node, here), ...pathFrom(from.node, toRoom, target)]
  }
  return pathFrom(nearestNode(...pos), toRoom, target)
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
  const seen = new Set()
  const taken = {}
  const kept = new Set()
  const seats = room => (taken[room] ??= new Set())
  for (const actor of office.actors) {
    const room = roomOf(actor.room)
    const sprite = sprites.get(actor.id)
    if (sprite && sprite.room === room && sprite.slot >= 0) {
      seats(room).add(sprite.slot)
      kept.add(actor.id)
    }
  }
  for (const actor of office.actors) {
    const room = roomOf(actor.room)
    let sprite = sprites.get(actor.id)
    let index = 0
    if (kept.has(actor.id)) {
      index = sprite.slot
    } else {
      while (seats(room).has(index)) index++
      seats(room).add(index)
    }
    const target = slotPos(room, index)
    seen.add(actor.id)
    if (!sprite) {
      const direct = placeDirect || actor.main
      const spawn = direct ? target : plan.spawn
      sprite = { id: actor.id, x: spawn[0], y: spawn[1], path: [], room: direct ? room : 'elevator', slot: direct ? index : -1, alpha: direct ? 1 : 0, gone: false, moving: false, phase: Math.random() * 6, face: direct ? slotFace(room, index) : 1 }
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
    sprite.path = reroute(sprite, 'elevator', plan.spawn)
    sprite.room = 'elevator'
    sprite.slot = -1
    sprite.data = { ...sprite.data, status: 'leaving', bubble: null }
  }
  placeDirect = false
}

function step(dt) {
  let busy = false
  const [ex, ey, ew, eh] = plan.rooms.elevator.rect
  for (const sprite of [...sprites.values()]) {
    let budget = SPEED * dt
    while (budget > 0 && sprite.path.length) {
      const { x: tx, y: ty } = sprite.path[0]
      const dx = tx - sprite.x
      const dy = ty - sprite.y
      const d = Math.hypot(dx, dy)
      if (Math.abs(dx - dy) > 0.01) sprite.face = dx - dy < 0 ? -1 : 1
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
    if (!sprite.moving && !sprite.gone && sprite.slot >= 0) sprite.face = slotFace(sprite.room, sprite.slot)
    if (sprite.gone) {
      if (!sprite.moving) sprite.alpha -= dt * 1.5
      if (sprite.alpha <= 0) sprites.delete(sprite.id)
    } else {
      sprite.alpha = Math.min(1, sprite.alpha + dt * 2)
    }
    if (sprite.x > ex && sprite.x < ex + ew && sprite.y > ey && sprite.y < ey + eh && (sprite.moving || sprite.alpha < 1)) busy = true
  }
  portalPower += ((busy ? 1 : 0) - portalPower) * Math.min(1, dt * 6)
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

const shades = new Map()

function shade(hex, f) {
  const id = `${hex}|${f}`
  let out = shades.get(id)
  if (!out) {
    const n = parseInt(hex.slice(1), 16)
    const ch = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)))
    out = `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`
    shades.set(id, out)
  }
  return out
}

function P(u, v, z = 0) {
  return [u - v, (u + v) / 2 - z]
}

function trace(points) {
  ctx.beginPath()
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
}

function poly(points, fill, stroke, width = 1) {
  trace(points)
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke() }
}

function quad(corners, fill, stroke) {
  poly(corners.map(c => P(...c)), fill, stroke)
}

function flat(u0, v0, u1, v1, z, fill, stroke) {
  quad([[u0, v0, z], [u1, v0, z], [u1, v1, z], [u0, v1, z]], fill, stroke)
}

function wallL(v, u0, u1, z0, z1, fill, stroke) {
  quad([[u0, v, z0], [u1, v, z0], [u1, v, z1], [u0, v, z1]], fill, stroke)
}

function wallR(u, v0, v1, z0, z1, fill, stroke) {
  quad([[u, v0, z0], [u, v1, z0], [u, v1, z1], [u, v0, z1]], fill, stroke)
}

function prism(u0, v0, u1, v1, z0, z1, color, edge) {
  wallL(v1, u0, u1, z0, z1, shade(color, 0.86), edge)
  wallR(u1, v0, v1, z0, z1, shade(color, 0.7), edge)
  flat(u0, v0, u1, v1, z1, color, edge)
}

function line3(a, b, color, width = 1.5) {
  ctx.beginPath()
  ctx.moveTo(...P(...a))
  ctx.lineTo(...P(...b))
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.stroke()
}

function hipRoof(u0, v0, u1, v1, z, h, color, between) {
  const half = Math.min(u1 - u0, v1 - v0) / 2
  const vc = (v0 + v1) / 2
  const a = [u0 + half, vc, z + h]
  const b = [u1 - half, vc, z + h]
  quad([[u0, v0, z], [u1, v0, z], b, a], shade(color, 0.86))
  quad([[u0, v0, z], a, [u0, v1, z]], shade(color, 1.06))
  if (between) between()
  quad([[u1, v0, z], [u1, v1, z], b], shade(color, 0.72))
  quad([[u0, v1, z], [u1, v1, z], b, a], color)
}

function gable(u0, v0, u1, v1, z, h, roof, wall, axis, between) {
  if (axis === 'u') {
    const vc = (v0 + v1) / 2
    quad([[u0, v0, z], [u1, v0, z], [u1, vc, z + h], [u0, vc, z + h]], shade(roof, 0.84))
    if (between) between()
    quad([[u1, v0 + 3, z], [u1, v1 - 3, z], [u1, vc, z + h - 3]], shade(wall, 0.7))
    quad([[u0, v1, z], [u1, v1, z], [u1, vc, z + h], [u0, vc, z + h]], roof)
    line3([u0, vc, z + h], [u1, vc, z + h], shade(roof, 0.6), 2)
  } else {
    const uc = (u0 + u1) / 2
    quad([[u0, v0, z], [u0, v1, z], [uc, v1, z + h], [uc, v0, z + h]], shade(roof, 1.04))
    if (between) between()
    quad([[u0 + 3, v1, z], [u1 - 3, v1, z], [uc, v1, z + h - 3]], shade(wall, 0.86))
    quad([[u1, v0, z], [u1, v1, z], [uc, v1, z + h], [uc, v0, z + h]], shade(roof, 0.74))
    line3([uc, v0, z + h], [uc, v1, z + h], shade(roof, 0.55), 2)
  }
}

function cyl(u, v, r, z0, z1, color) {
  const [x, yb] = P(u, v, z0)
  const yt = yb - (z1 - z0)
  const rx = r * Math.SQRT2
  const ry = rx / 2
  const grad = ctx.createLinearGradient(x - rx, 0, x + rx, 0)
  grad.addColorStop(0, shade(color, 0.98))
  grad.addColorStop(0.45, shade(color, 0.88))
  grad.addColorStop(1, shade(color, 0.62))
  ctx.beginPath()
  ctx.moveTo(x - rx, yt)
  ctx.lineTo(x - rx, yb)
  ctx.ellipse(x, yb, rx, ry, 0, Math.PI, 0, true)
  ctx.lineTo(x + rx, yt)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x, yt, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

function cone(u, v, r, z0, h, color) {
  const [x, y] = P(u, v, z0)
  const rx = r * Math.SQRT2
  const ry = rx / 2
  const grad = ctx.createLinearGradient(x - rx, 0, x + rx, 0)
  grad.addColorStop(0, shade(color, 1.1))
  grad.addColorStop(0.5, color)
  grad.addColorStop(1, shade(color, 0.66))
  ctx.beginPath()
  ctx.moveTo(x, y - h)
  ctx.lineTo(x - rx, y)
  ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0, true)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()
}

function disk(u, v, r, z, fill, stroke, width = 1) {
  const [x, y] = P(u, v, z)
  ctx.beginPath()
  ctx.ellipse(x, y, r * Math.SQRT2, (r * Math.SQRT2) / 2, 0, 0, Math.PI * 2)
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke() }
}

function trail(points, width, color) {
  ctx.beginPath()
  points.forEach(([u, v], i) => (i ? ctx.lineTo(...P(u, v)) : ctx.moveTo(...P(u, v))))
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
}

function flame(x, y, t, size = 1) {
  const f = 1 + Math.sin(t * 13 + x) * 0.15
  ctx.beginPath()
  ctx.ellipse(x, y - 3 * size * f, 2.6 * size, 4.4 * size * f, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#ff9d2e'
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x, y - 2.4 * size * f, 1.3 * size, 2.4 * size * f, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#ffe08a'
  ctx.fill()
}

function waveFlag(x, y, w, h, t, color) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  for (let i = 0; i <= 6; i++) ctx.lineTo(x + (w * i) / 6, y + Math.sin(t * 5 + i * 0.9) * 1.6 * (i / 6))
  for (let i = 6; i >= 0; i--) ctx.lineTo(x + (w * i) / 6, y + h + Math.sin(t * 5 + i * 0.9) * 1.6 * (i / 6))
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function lines3(segments, color, width = 1) {
  ctx.beginPath()
  for (const [a, b] of segments) {
    ctx.moveTo(...P(...a))
    ctx.lineTo(...P(...b))
  }
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.stroke()
}

function ringR(u, v, z, r, fill, stroke) {
  const pts = []
  for (let k = 0; k < 16; k++) pts.push([u, v + Math.cos((k * Math.PI) / 8) * r, z + Math.sin((k * Math.PI) / 8) * r])
  quad(pts, fill, stroke)
}

function ringL(v, u, z, r, fill, stroke) {
  const pts = []
  for (let k = 0; k < 16; k++) pts.push([u + Math.cos((k * Math.PI) / 8) * r, v, z + Math.sin((k * Math.PI) / 8) * r])
  quad(pts, fill, stroke)
}

function windowR(u, v0, v1, z0, z1, frame = '#8a6a3a') {
  archR(u, v0 - 2, v1 + 2, z0 - 2, z1 + 2, frame)
  archR(u + 0.1, v0, v1, z0, z1, '#a9d8f0')
  const vc = (v0 + v1) / 2
  lines3([[[u + 0.2, vc, z0], [u + 0.2, vc, z1]], [[u + 0.2, v0, (z0 + z1) / 2 - 2], [u + 0.2, v1, (z0 + z1) / 2 - 2]]], frame, 1.5)
  quad([[u + 0.2, v0 + 2, z0 + 4], [u + 0.2, v0 + 6, z0 + 4], [u + 0.2, vc - 2, z1 - 6], [u + 0.2, vc - 5, z1 - 8]], 'rgba(255, 255, 255, 0.45)')
}

function windowL(v, u0, u1, z0, z1, frame = '#8a6a3a') {
  archL(v, u0 - 2, u1 + 2, z0 - 2, z1 + 2, frame)
  archL(v + 0.1, u0, u1, z0, z1, '#a9d8f0')
  const uc = (u0 + u1) / 2
  lines3([[[uc, v + 0.2, z0], [uc, v + 0.2, z1]], [[u0, v + 0.2, (z0 + z1) / 2 - 2], [u1, v + 0.2, (z0 + z1) / 2 - 2]]], frame, 1.5)
  quad([[u0 + 2, v + 0.2, z0 + 4], [u0 + 6, v + 0.2, z0 + 4], [uc - 2, v + 0.2, z1 - 6], [uc - 5, v + 0.2, z1 - 8]], 'rgba(255, 255, 255, 0.45)')
}

function planks(axis, gap, color, joint) {
  const segs = []
  for (let k = WALL_T + gap; k < CELL; k += gap) {
    segs.push(axis === 'u' ? [[WALL_T, k, 0], [CELL, k, 0]] : [[k, WALL_T, 0], [k, CELL, 0]])
    const row = Math.round(k / gap)
    for (let a = WALL_T + ((row * 17) % joint); a < CELL; a += joint) {
      segs.push(axis === 'u' ? [[a, k - gap, 0], [a, k, 0]] : [[k - gap, a, 0], [k, a, 0]])
    }
  }
  lines3(segs, color, 1)
}

function checker(size, color) {
  ctx.beginPath()
  for (let a = 0; a * size < CELL; a++) {
    for (let b = 0; b * size < CELL; b++) {
      if ((a + b) % 2) continue
      const u0 = Math.max(WALL_T, a * size)
      const v0 = Math.max(WALL_T, b * size)
      const u1 = Math.min(CELL, (a + 1) * size)
      const v1 = Math.min(CELL, (b + 1) * size)
      if (u1 <= u0 || v1 <= v0) continue
      const pts = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
    }
  }
  ctx.fillStyle = color
  ctx.fill()
}

function rug(u0, v0, u1, v1, fill, trim) {
  flat(u0, v0, u1, v1, 0, fill)
  quad([[u0 + 4, v0 + 4, 0], [u1 - 4, v0 + 4, 0], [u1 - 4, v1 - 4, 0], [u0 + 4, v1 - 4, 0]], null, trim)
  quad([[u0 + 8, v0 + 8, 0], [u1 - 8, v0 + 8, 0], [u1 - 8, v1 - 8, 0], [u0 + 8, v1 - 8, 0]], null, trim)
}

function speckle(count, colors, seed) {
  for (let k = 0; k < count; k++) {
    const u = WALL_T + 4 + ((k * 53 + seed) % (CELL - WALL_T - 8))
    const v = WALL_T + 4 + ((k * 97 + seed * 3) % (CELL - WALL_T - 8))
    circle(...P(u, v), 1.3, colors[k % colors.length])
  }
}

const FLOORS = {
  library() {
    planks('u', 10, 'rgba(90, 55, 25, 0.24)', 46)
    rug(58, 56, 126, 114, '#6d4aa8', '#e8c25a')
  },
  meeting() {
    speckle(70, ['rgba(120, 90, 50, 0.35)', 'rgba(255, 245, 220, 0.4)'], 7)
    rug(44, 44, 132, 116, '#b8463a', '#f0d27a')
  },
  dev() {
    const segs = []
    for (let b = 0; b * 28 < CELL; b++) {
      const v = WALL_T + b * 28
      segs.push([[WALL_T, v, 0], [CELL, v, 0]])
      for (let u = WALL_T + (b % 2) * 14; u < CELL; u += 28) segs.push([[u, v, 0], [u, Math.min(CELL, v + 28), 0]])
    }
    lines3(segs, 'rgba(50, 45, 40, 0.3)', 1.5)
    disk(34, 34, 40, 0, 'rgba(40, 30, 25, 0.18)')
    disk(98, 76, 24, 0, 'rgba(40, 30, 25, 0.12)')
  },
  server() {
    checker(29, 'rgba(60, 55, 50, 0.13)')
    lines3([[[WALL_T, 120, 0], [CELL, 120, 0]]], 'rgba(60, 55, 50, 0.1)', 1)
  },
  info() {
    planks('v', 14, 'rgba(90, 60, 30, 0.25)', 52)
    disk(42, 54, 22, 0, 'rgba(255, 240, 200, 0.18)')
  },
  lounge() {
    planks('u', 12, 'rgba(60, 35, 15, 0.28)', 40)
    rug(48, 60, 138, 130, '#8c3b2f', '#e0b441')
  },
  desk() {
    checker(20, '#d8cfb8')
    rug(48, 66, 120, 94, '#3f6fb5', '#e8c25a')
    flat(GATE_AT - 12, 98, GATE_AT + 12, CELL, 0, '#b8463a')
    lines3([[[GATE_AT - 9, 98, 0], [GATE_AT - 9, CELL, 0]], [[GATE_AT + 9, 98, 0], [GATE_AT + 9, CELL, 0]]], '#e8c25a', 1)
  },
  elevator() {
    const segs = []
    for (let k = WALL_T + 29; k < CELL; k += 29) segs.push([[WALL_T, k, 0], [CELL, k, 0]], [[k, WALL_T, 0], [k, CELL, 0]])
    lines3(segs, 'rgba(30, 30, 50, 0.25)', 1)
    disk(40, 40, 30, 0, 'rgba(60, 50, 110, 0.35)', 'rgba(155, 231, 255, 0.4)', 1.5)
    disk(SPAWN[0], SPAWN[1], 26, 0, '#6d6f8c', '#5a5c78', 1.5)
  },
}

function paintPlaza() {
  poly([P(0, 0), P(CELL, 0), P(CELL, CELL), P(0, CELL)], '#e6dfcf')
  const band = '#c7bda8'
  flat(0, 0, CELL, 6, 0, band)
  flat(0, 0, 6, CELL, 0, band)
  flat(0, CELL - 6, CELL, CELL, 0, band)
  flat(CELL - 6, 0, CELL, CELL, 0, band)
  for (let r = 74; r >= 30; r -= 22) disk(90, 90, r, 0, r % 44 ? '#ddd4c0' : '#e9e2d2', '#cfc5ae')
  for (const [u, v] of [[28, 28], [152, 28], [28, 152], [152, 152]]) {
    disk(u, v, 13, 0, '#7fbf5c', '#6aa84b')
    for (let k = 0; k < 6; k++) circle(...P(u + Math.cos(k) * 7, v + Math.sin(k * 1.7) * 7), 1.8, ['#ff6b81', '#ffd166', '#c792ea'][k % 3])
  }
  prism(84, 150, 112, 158, 0, 6, '#9b6b43')
  prism(150, 84, 158, 112, 0, 6, '#9b6b43')
}

function paintFloor(room) {
  ctx.save()
  if (room.key === 'plaza') {
    paintPlaza()
    ctx.restore()
    return
  }
  poly([P(0, 0), P(CELL, 0), P(CELL, CELL), P(0, CELL)], room.floor)
  FLOORS[room.key]?.()
  const shadow = 'rgba(40, 30, 20, 0.14)'
  flat(WALL_T, WALL_T, CELL, WALL_T + 12, 0, shadow)
  flat(WALL_T, WALL_T + 12, WALL_T + 12, CELL, 0, shadow)
  const mat = room.gate === 'right' ? [CELL - 26, GATE_AT - 14, CELL - 8, GATE_AT + 14] : [GATE_AT - 14, CELL - 26, GATE_AT + 14, CELL - 8]
  flat(...mat, 0, '#8a5a35')
  quad([[mat[0] + 2, mat[1] + 2, 0], [mat[2] - 2, mat[1] + 2, 0], [mat[2] - 2, mat[3] - 2, 0], [mat[0] + 2, mat[3] - 2, 0]], null, '#c49a52')
  const sill = room.gate === 'right' ? [CELL - WALL_T, GATE_AT - GATE_W / 2, CELL, GATE_AT + GATE_W / 2] : [GATE_AT - GATE_W / 2, CELL - WALL_T, GATE_AT + GATE_W / 2, CELL]
  flat(...sill, 0, '#b9ad94')
  ctx.restore()
}

function paintTerrain(p) {
  const [gx0, gy0] = [p.y0 + p.x0 / 2 - 60, p.y0 - (p.x0 + p.w) / 2 - 60]
  const [gx1, gy1] = [p.y0 + p.h + (p.x0 + p.w) / 2 + 60, p.y0 + p.h - p.x0 / 2 + 60]
  const tile = PITCH / 4
  ctx.fillStyle = '#8ac765'
  for (let a = Math.floor(gx0 / tile); a * tile < gx1; a++) {
    for (let b = Math.floor(gy0 / tile); b * tile < gy1; b++) {
      if ((a + b) % 2) continue
      trace([P(a * tile, b * tile), P((a + 1) * tile, b * tile), P((a + 1) * tile, (b + 1) * tile), P(a * tile, (b + 1) * tile)])
      ctx.fill()
    }
  }
  const square = ([ax, ay, bx, by], pad) => [P(ax - pad, ay - pad), P(bx + pad, ay - pad), P(bx + pad, by + pad), P(ax - pad, by + pad)]
  for (const sq of p.squares) poly(square(sq, 2.5), '#b7a88a')
  ctx.beginPath()
  for (const sq of p.squares) {
    const pts = square(sq, 0)
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
  }
  ctx.fillStyle = '#dcccaa'
  ctx.fill('nonzero')
  ctx.save()
  ctx.clip('nonzero')
  ctx.strokeStyle = 'rgba(120, 100, 70, 0.13)'
  ctx.lineWidth = 1
  for (let a = Math.floor(gx0 / 16); a * 16 < gx1; a++) {
    ctx.beginPath()
    ctx.moveTo(...P(a * 16, gy0))
    ctx.lineTo(...P(a * 16, gy1))
    ctx.stroke()
  }
  for (let b = Math.floor(gy0 / 16); b * 16 < gy1; b++) {
    ctx.beginPath()
    ctx.moveTo(...P(gx0, b * 16))
    ctx.lineTo(...P(gx1, b * 16))
    ctx.stroke()
  }
  ctx.restore()
  for (const room of [...Object.values(p.rooms), p.plaza]) {
    ctx.save()
    ctx.translate(...project(...room.origin))
    paintFloor(room)
    ctx.restore()
  }
  for (const [x, y, r, seed] of p.trees) paintTree(x, y, r, seed)
}

function paintTree(x, y, r, seed) {
  const [sx, sy] = project(x, y)
  ctx.fillStyle = 'rgba(30, 60, 20, 0.22)'
  ctx.beginPath()
  ctx.ellipse(sx, sy, r * 0.9, r * 0.42, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#7a5230'
  ctx.fillRect(sx - 2.5, sy - 16, 5, 16)
  const greens = [['#3f8a3a', '#57a847', '#7cc95e'], ['#2f7a45', '#3f9a58', '#6cc27a'], ['#4f8f2f', '#6aae3c', '#94d061']][seed % 3]
  const cy = sy - 14 - r
  if (seed % 4 === 0) {
    poly([[sx, cy - r * 1.3], [sx - r, cy + r * 0.8], [sx + r, cy + r * 0.8]], greens[0])
    poly([[sx, cy - r * 1.3], [sx - r * 0.2, cy + r * 0.8], [sx + r, cy + r * 0.8]], greens[1])
    return
  }
  circle(sx, cy, r, greens[0])
  circle(sx - r * 0.3, cy - r * 0.25, r * 0.72, greens[1])
  circle(sx - r * 0.42, cy - r * 0.45, r * 0.32, greens[2])
}

function groundKey() {
  return [plan.id, ui.canvas.width, ui.canvas.height, view.dpr, view.scale, view.ox, view.oy].join('|')
}

function buildGround() {
  const canvas = document.createElement('canvas')
  canvas.width = ui.canvas.width
  canvas.height = ui.canvas.height
  const saved = ctx
  ctx = canvas.getContext('2d')
  try {
    ctx.fillStyle = GRASS
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const s = view.dpr * view.scale
    ctx.setTransform(s, 0, 0, s, view.dpr * view.ox, view.dpr * view.oy)
    paintTerrain(plan)
  } finally {
    ctx = saved
  }
  return { key: groundKey(), canvas }
}

function archPts(a0, a1, z0, z1) {
  const r = (a1 - a0) / 2
  const c = a0 + r
  const pts = [[a0, z0], [a1, z0], [a1, z1 - r]]
  for (let k = 1; k < 6; k++) {
    const ang = (Math.PI * k) / 6
    pts.push([c + Math.cos(ang) * r, z1 - r + Math.sin(ang) * r])
  }
  pts.push([a0, z1 - r])
  return pts
}

function archL(v, u0, u1, z0, z1, fill, stroke) {
  quad(archPts(u0, u1, z0, z1).map(([a, z]) => [a, v, z]), fill, stroke)
}

function archR(u, v0, v1, z0, z1, fill, stroke) {
  quad(archPts(v0, v1, z0, z1).map(([a, z]) => [u, a, z]), fill, stroke)
}

function smoke(x, y, t) {
  for (let k = 0; k < 3; k++) {
    const ph = (t * 0.35 + k / 3) % 1
    circle(x + ph * 10 + Math.sin(t + k) * 2, y - ph * 34, 4 + ph * 7, `rgba(225, 225, 225, ${0.6 * (1 - ph)})`)
  }
}

const LW = WALL_T + 0.3
const RW = WALL_T + 0.3
const WOOD = '#8b5a2b'
const DARK_WOOD = '#5b3a24'
const BOOKS = ['#b8463a', '#3f6fb5', '#3f8f4f', '#e0b441', '#7a56b8', '#d9853b', '#2b9aa0', '#8a5a35']

function onLeft(v0, v1, z0, z1, fill, stroke) {
  wallR(LW, v0, v1, z0, z1, fill, stroke)
}

function onRight(u0, u1, z0, z1, fill, stroke) {
  wallL(RW, u0, u1, z0, z1, fill, stroke)
}

function shell(room) {
  const c = room.wall
  wallR(WALL_T, WALL_T, CELL, 0, WALL_H, shade(c, 0.9))
  wallL(CELL, 0, WALL_T, 0, WALL_H, shade(c, 0.78))
  wallL(WALL_T, WALL_T, CELL, 0, WALL_H, c)
  wallR(CELL, 0, WALL_T, 0, WALL_H, shade(c, 0.7))
  onLeft(WALL_T, CELL, 0, 4, shade(c, 0.68))
  onRight(WALL_T, CELL, 0, 4, shade(c, 0.76))
  lines3([[[LW, LW, 0], [LW, LW, WALL_H]]], 'rgba(0, 0, 0, 0.12)', 1)
  flat(0, 0, WALL_T, CELL, WALL_H, CUT, 'rgba(120, 100, 80, 0.4)')
  flat(WALL_T, 0, CELL, WALL_T, WALL_H, CUT, 'rgba(120, 100, 80, 0.4)')
}

function wainscot(color, top) {
  onLeft(WALL_T, CELL, 0, top, shade(color, 0.9))
  onRight(WALL_T, CELL, 0, top, color)
  wallR(LW + 0.1, WALL_T, CELL, top - 2, top, shade(color, 0.7))
  wallL(RW + 0.1, WALL_T, CELL, top - 2, top, shade(color, 0.8))
}

function stones(color) {
  const segs = []
  for (let z = 10; z < WALL_H; z += 10) {
    segs.push([[LW, WALL_T, z], [LW, CELL, z]], [[WALL_T, RW, z], [CELL, RW, z]])
  }
  for (let z = 0; z < WALL_H; z += 10) {
    const off = (z / 10) % 2 ? 0 : 11
    const top = Math.min(WALL_H, z + 10)
    for (let a = WALL_T + 8 + off; a < CELL; a += 22) segs.push([[LW, a, z], [LW, a, top]], [[a, RW, z], [a, RW, top]])
  }
  lines3(segs, color, 1)
}

function posts(at, color, from = 0) {
  for (const a of at) {
    onLeft(a - 2.5, a + 2.5, from, WALL_H, shade(color, 0.85))
    onRight(a - 2.5, a + 2.5, from, WALL_H, color)
  }
}

function torchLeft(v, z, t) {
  lines3([[[LW, v, z - 10], [LW + 5, v, z]]], DARK_WOOD, 2.5)
  flame(...P(LW + 5, v, z + 1), t)
}

function torchRight(u, z, t) {
  lines3([[[u, RW, z - 10], [u, RW + 5, z]]], DARK_WOOD, 2.5)
  flame(...P(u, RW + 5, z + 1), t)
}

function lantern(u, v, z, t) {
  lines3([[[u, v, z + 8], [u, v, WALL_H]]], '#3a2a1a', 1)
  prism(u - 3, v - 3, u + 3, v + 3, z - 6, z + 4, '#3a2a1a')
  const [x, y] = P(u + 3.1, v, z - 1)
  circle(x - 2, y, 2.4, `rgba(255, 207, 112, ${0.8 + 0.2 * Math.sin(t * 7 + u)})`)
}

function shieldLeft(v, z, fill, mark) {
  quad([[LW, v - 8, z + 9], [LW, v + 8, z + 9], [LW, v + 8, z - 2], [LW, v, z - 10], [LW, v - 8, z - 2]], fill, '#e0b441')
  lines3([[[LW + 0.2, v, z + 7], [LW + 0.2, v, z - 6]], [[LW + 0.2, v - 5, z + 2], [LW + 0.2, v + 5, z + 2]]], mark, 2)
}

function shieldRight(u, z, fill, mark) {
  quad([[u - 8, RW, z + 9], [u + 8, RW, z + 9], [u + 8, RW, z - 2], [u, RW, z - 10], [u - 8, RW, z - 2]], fill, '#e0b441')
  lines3([[[u, RW + 0.2, z + 7], [u, RW + 0.2, z - 6]], [[u - 5, RW + 0.2, z + 2], [u + 5, RW + 0.2, z + 2]]], mark, 2)
}

function banner(u0, u1, z0, z1, fill, mark, t) {
  const uc = (u0 + u1) / 2
  quad([[u0, RW, z1], [u1, RW, z1], [u1, RW, z0 + 6], [uc, RW, z0], [u0, RW, z0 + 6]], fill)
  lines3([[[u0 - 2, RW + 0.3, z1], [u1 + 2, RW + 0.3, z1]]], DARK_WOOD, 2)
  ringL(RW + 0.2, uc, (z0 + z1) / 2 + 4, 4, mark)
}

const UNDER = {
  elevator(t) {
    const power = 0.3 + 0.7 * portalPower
    disk(SPAWN[0], SPAWN[1], 22, 0, null, `rgba(155, 231, 255, ${power})`, 2)
    disk(SPAWN[0], SPAWN[1], 15, 0, null, `rgba(190, 160, 255, ${power * 0.8})`, 1.5)
    for (let k = 0; k < 8; k++) {
      const a = t * 0.8 + (k * Math.PI) / 4
      circle(...P(SPAWN[0] + Math.cos(a) * 18.5, SPAWN[1] + Math.sin(a) * 18.5), 1.8, `rgba(220, 245, 255, ${power})`)
    }
  },
}

const LOOKS = {
  library(t) {
    wainscot('#8b5a2b', 14)
    windowR(LW + 0.2, 132, 158, 30, 58)
    windowL(RW + 0.2, 144, 170, 30, 58)
    flame(...P(LW + 3, 124, 46), t, 0.7)
    flame(...P(20, RW + 3, 56), t, 0.7)
  },
  dev(t) {
    stones('rgba(50, 40, 30, 0.3)')
    lines3([[[60, RW + 1, 54], [132, RW + 1, 54]]], DARK_WOOD, 2)
    for (let u = 66; u <= 126; u += 15) {
      if ((u / 15) % 2 < 1) {
        lines3([[[u, RW + 1.5, 54], [u, RW + 1.5, 34]]], '#7a5434', 2)
        prism(u - 4, RW + 0.5, u + 4, RW + 3, 30, 36, '#5d6068')
      } else {
        lines3([[[u - 2, RW + 1.5, 54], [u - 3, RW + 1.5, 32]], [[u + 2, RW + 1.5, 54], [u + 3, RW + 1.5, 32]]], '#4a4a52', 1.5)
      }
    }
    torchLeft(152, 46, t)
    torchRight(144, 46, t)
  },
  server(t) {
    stones('rgba(40, 45, 55, 0.28)')
    for (const v of [44, 84]) shieldLeft(v, 40, v === 44 ? '#c0392b' : '#2f62c9', '#f3d36b')
    banner(136, 156, 20, 58, '#a8322f', '#e0b441', t)
    torchLeft(110, 44, t)
    const merlons = []
    for (let k = 4; k < CELL - 8; k += 20) merlons.push([0, k + 8, WALL_T, k + 16], [k + 8, 0, k + 16, WALL_T])
    merlons.sort((a, b) => a[0] + a[1] - b[0] - b[1])
    for (const [u0, v0, u1, v1] of merlons) prism(u0, v0, u1, v1, WALL_H, WALL_H + 7, '#b5b0a5')
  },
  info(t) {
    posts([30, 70, 110, 150], '#7a5434', 0)
    onLeft(WALL_T, CELL, 40, 43, '#6a4a2e')
    onRight(WALL_T, CELL, 40, 43, '#7a5434')
    windowR(LW + 0.2, 80, 100, 14, 36)
    onLeft(118, 144, 12, 36, '#b98a4a', '#7a5434')
    for (const [a, b, z] of [[121, 129, 26], [131, 141, 28], [124, 134, 16]]) wallR(LW + 0.3, a, b, z, z + 7, '#fbf6e6')
    circle(...P(LW + 0.4, 125, 33), 1.3, '#c0392b')
    circle(...P(LW + 0.4, 136, 35), 1.3, '#2f62c9')
    windowL(RW + 0.2, 84, 104, 14, 36)
    windowL(RW + 0.2, 124, 144, 14, 36)
    lantern(160, 40, 50, t)
  },
  meeting(t) {
    const red = '#c94a3a'
    const cream = '#f3e6cc'
    for (let k = 0; WALL_T + k * 14 < CELL; k++) {
      const a = WALL_T + k * 14
      const b = Math.min(CELL, a + 14)
      onLeft(a, b, 0, WALL_H, shade(k % 2 ? red : cream, 0.9))
      onRight(a, b, 0, WALL_H, k % 2 ? red : cream)
    }
    for (let a = WALL_T; a < CELL; a += 14) {
      quad(archPts(a, a + 14, WALL_H - 10, WALL_H + 0.01).map(([p, z]) => [LW + 0.2, p, WALL_H * 2 - 10 - z]), '#9e2f25')
      quad(archPts(a, a + 14, WALL_H - 10, WALL_H + 0.01).map(([p, z]) => [p, RW + 0.2, WALL_H * 2 - 10 - z]), '#b8392e')
    }
    lines3([[[LW, LW, 0], [LW, LW, WALL_H]]], DARK_WOOD, 3)
    onLeft(60, 118, 18, 50, '#efd9a0', '#9a7a46')
    lines3([[[LW + 0.3, 66, 30], [LW + 0.3, 82, 40]], [[LW + 0.3, 82, 40], [LW + 0.3, 98, 34]], [[LW + 0.3, 98, 34], [LW + 0.3, 112, 44]]], '#3f6fb5', 1.5)
    lines3([[[LW + 0.3, 88, 24], [LW + 0.3, 94, 30]], [[LW + 0.3, 88, 30], [LW + 0.3, 94, 24]]], '#c0392b', 1.5)
    banner(70, 92, 16, 52, '#2f62c9', '#f3d36b', t)
  },
  lounge(t) {
    wainscot('#7a4a2a', 20)
    posts([46, 86, 126], DARK_WOOD, 20)
    onLeft(WALL_T, CELL, WALL_H - 4, WALL_H, shade(DARK_WOOD, 0.85))
    onRight(WALL_T, CELL, WALL_H - 4, WALL_H, DARK_WOOD)
    for (const z of [34, 48]) {
      prism(50, RW, 138, RW + 5, z - 2, z, '#7a4a2a')
      for (let u = 54, k = z; u < 134; u += 8, k++) {
        prism(u, RW + 1, u + 3, RW + 4, z, z + 7 + (k % 3), ['#3f8f4f', '#8a2f2f', '#c9a045', '#4a6fa5'][k % 4])
      }
    }
    lantern(150, 30, 46, t)
    lantern(30, 150, 46, t)
  },
  desk(t) {
    posts([50, 94, 138], '#fbf8ef', 0)
    onLeft(WALL_T, CELL, 54, 58, '#4f7fc4')
    onRight(WALL_T, CELL, 54, 58, '#5b8bd0')
    for (const v of [62, 106, 150]) windowR(LW + 0.2, v + 4, v + 22, 22, 48, '#c9b98f')
    windowL(RW + 0.2, 20, 40, 22, 48, '#c9b98f')
    windowL(RW + 0.2, 106, 126, 22, 48, '#c9b98f')
    shieldRight(72, 40, '#4f7fc4', '#f3d36b')
    onRight(146, 170, 34, 50, '#b98a4a', '#7a5434')
    for (const [a, b, z] of [[149, 157, 40], [159, 167, 42], [152, 162, 36]]) wallL(RW + 0.3, a, b, z, z + 6, '#fbf6e6')
  },
  elevator(t) {
    stones('rgba(20, 20, 40, 0.3)')
    const glow = (0.35 + 0.65 * portalPower) * (0.7 + 0.3 * Math.sin(t * 2))
    const color = `rgba(155, 231, 255, ${glow})`
    for (const a of [40, 90, 140]) {
      ringR(LW + 0.2, a, 36, 6, null, color)
      lines3([[[LW + 0.2, a, 28], [LW + 0.2, a, 44]], [[LW + 0.2, a - 5, 33], [LW + 0.2, a + 5, 39]]], color, 1.5)
      ringL(RW + 0.2, a, 36, 6, null, color)
      lines3([[[a, RW + 0.2, 28], [a, RW + 0.2, 44]], [[a - 5, RW + 0.2, 39], [a + 5, RW + 0.2, 33]]], color, 1.5)
    }
  },
}

function legs(u0, v0, u1, v1, z, color, w = 3) {
  for (const [a, b] of [[u0 + 1, v0 + 1], [u1 - 1 - w, v0 + 1], [u0 + 1, v1 - 1 - w], [u1 - 1 - w, v1 - 1 - w]]) prism(a, b, a + w, b + w, 0, z, color)
}

function table(u0, v0, u1, v1, h, color) {
  legs(u0, v0, u1, v1, h - 3, DARK_WOOD)
  prism(u0, v0, u1, v1, h - 3, h, color)
}

function shelfBooks(side, at, a0, a1, h) {
  const face = side === 'R'
    ? (a, b, z0, z1, c) => wallR(at + 0.2, a, b, z0, z1, c)
    : (a, b, z0, z1, c) => wallL(at + 0.2, a, b, z0, z1, c)
  face(a0 + 2, a1 - 2, 2, h - 2, '#3a2616')
  for (let z = 3; z + 10 <= h - 2; z += 12) {
    let a = a0 + 3
    let k = Math.round(a0 * 7 + z)
    while (a < a1 - 5) {
      const w = 2.5 + (k % 3)
      face(a, Math.min(a + w, a1 - 3), z, z + 7 + (k % 4), BOOKS[k % BOOKS.length])
      a += w + 0.6
      k = (k * 7 + 3) % 97
    }
    face(a0 + 2, a1 - 2, z + 10.5, z + 12, '#7a5434')
  }
}

function sparks(x, y, t, count, reach) {
  for (let k = 0; k < count; k++) {
    const ph = (t * 1.7 + k * 0.23) % 1
    const a = k * 1.3 + Math.floor(t * 1.7 + k * 0.23) * 2.1
    circle(x + Math.cos(a) * ph * reach, y - ph * 12 + ph * ph * 16, 1.2, `rgba(255, ${200 - (k % 5) * 20}, 60, ${1 - ph})`)
  }
}

function glowAt(x, y, r, color) {
  const grad = ctx.createRadialGradient(x, y, 1, x, y, r)
  grad.addColorStop(0, color)
  grad.addColorStop(1, 'rgba(255, 180, 80, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
}

function barrel(u, v, r = 8, h = 18) {
  cyl(u, v, r, 0, h, '#8b5a2b')
  disk(u, v, r, h * 0.28, null, '#4a3a2a', 1.2)
  disk(u, v, r, h * 0.72, null, '#4a3a2a', 1.2)
}

function mug(u, v, z) {
  cyl(u, v, 1.8, z, z + 4.5, '#e8c25a')
  disk(u, v, 1.8, z + 4.5, '#fffaf0')
}

const FURN = {
  shelfL(u0, v0, u1, v1) {
    prism(u0, v0, u1, v1, 0, 52, '#7a5434')
    shelfBooks('R', u1, v0, v1, 52)
  },
  shelfR(u0, v0, u1, v1) {
    prism(u0, v0, u1, v1, 0, 52, '#7a5434')
    shelfBooks('L', v1, u0, u1, 52)
    const a = u0 + (u1 - u0) * 0.86
    const segs = [[[a, v1 + 9, 0], [a, v1 + 1, 50]], [[a + 8, v1 + 9, 0], [a + 8, v1 + 1, 50]]]
    for (let k = 1; k < 7; k++) segs.push([[a, v1 + 9 - (8 * k) / 7, (50 * k) / 7], [a + 8, v1 + 9 - (8 * k) / 7, (50 * k) / 7]])
    lines3(segs, '#a0683a', 1.8)
  },
  plant(u0, v0, u1, v1, t) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    const r = (u1 - u0) / 2
    cyl(u, v, r * 0.62, 0, 10, '#b5653a')
    const [x, y] = P(u, v, 10)
    const sway = Math.sin(t * 1.3 + u) * 0.8
    circle(x + sway, y - 7, r * 0.95, '#3f8a3a')
    circle(x - 3 + sway, y - 12, r * 0.72, '#57a847')
    circle(x + 3 + sway, y - 15, r * 0.5, '#7cc95e')
  },
  readingTable(u0, v0, u1, v1, t, busy) {
    table(u0, v0, u1, v1, 16, WOOD)
    const uc = (u0 + u1) / 2
    const vc = (v0 + v1) / 2
    flat(uc - 10, vc - 7, uc + 8, vc + 5, 16.2, '#fbf6e6', '#c9b98f')
    line3([uc - 1, vc - 7, 16.4], [uc - 1, vc + 5, 16.4], '#c9b98f', 1)
    prism(u0 + 4, v1 - 13, u0 + 15, v1 - 4, 16, 19, '#3f6fb5')
    prism(u0 + 5, v1 - 12, u0 + 14, v1 - 5, 19, 22, '#b8463a')
    cyl(u1 - 6, v0 + 6, 1.4, 16, 24, '#f6efdc')
    flame(...P(u1 - 6, v0 + 6, 25), t, 0.7)
    if (busy) {
      for (let k = 0; k < 2; k++) {
        const ph = (t * 0.7 + k * 0.5) % 1
        const [x, y] = P(uc - 2, vc - 2, 20 + ph * 26)
        ctx.save()
        ctx.globalAlpha *= 1 - ph
        poly([[x - 4, y], [x + 3, y - 2 + Math.sin(t * 6 + k) * 1.5], [x + 4, y + 3], [x - 3, y + 5]], '#fffdf3', '#d6c7a0')
        ctx.restore()
      }
    }
  },
  globe(u0, v0, u1, v1, t, busy) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    cyl(u, v, 4.5, 0, 2, DARK_WOOD)
    line3([u, v, 2], [u, v, 16], DARK_WOOD, 2)
    const [x, y] = P(u, v, 24)
    circle(x, y, 8.5, '#4f8fd6', '#2f62a0')
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, 8.5, 0, Math.PI * 2)
    ctx.clip()
    const spin = ((t * (busy ? 2.2 : 0.35)) % 2) * 17 - 17
    for (const dx of [spin, spin + 17, spin + 34]) {
      ctx.beginPath()
      ctx.ellipse(x - 8 + dx, y - 2, 4, 3, 0.4, 0, Math.PI * 2)
      ctx.ellipse(x - 5 + dx, y + 4, 2.5, 2, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#6ab04c'
      ctx.fill()
    }
    ctx.restore()
    ctx.beginPath()
    ctx.ellipse(x, y, 10.5, 10.5, 0, Math.PI * 0.75, Math.PI * 2.25)
    ctx.strokeStyle = '#c9a045'
    ctx.lineWidth = 1.5
    ctx.stroke()
  },
  hearth(u0, v0, u1, v1, t, busy) {
    prism(u0, v0, u1, v1, 0, 20, '#8a8277')
    lines3([[[u0, v1 + 0.2, 10], [u1, v1 + 0.2, 10]], [[u1 + 0.2, v0, 10], [u1 + 0.2, v1, 10]]], 'rgba(40, 30, 20, 0.3)', 1)
    const pulse = Math.sin(t * 3.1) * Math.sin(t * 1.7 + 1)
    const glow = busy ? 0.8 + 0.2 * pulse : 0.35 + 0.15 * pulse
    flat(u0 + 4, v0 + 4, u1 - 4, v1 - 4, 20.2, '#3a2a22')
    flat(u0 + 8, v0 + 8, u1 - 8, v1 - 8, 20.4, `rgba(255, ${110 + Math.round(70 * glow)}, 40, ${0.5 + 0.5 * glow})`)
    const n = busy ? 5 : 2
    for (let k = 0; k < n; k++) flame(...P(u0 + 14 + ((k * 9) % 22), v0 + 14 + ((k * 13) % 22), 20), t + k, busy ? 1.6 : 1)
    prism(u1 - 5, v0 + 1, u1 - 1, v0 + 5, 20, 42, '#5e4430')
    prism(u0 + 1, v1 - 5, u0 + 5, v1 - 1, 20, 42, '#5e4430')
    quad([[u0 + 2, v1 - 2, 42], [u1 - 2, v1 - 2, 42], [u0 + 30, v0 + 30, 56], [u0 + 10, v0 + 30, 56]], '#6f675e')
    quad([[u1 - 2, v0 + 2, 42], [u1 - 2, v1 - 2, 42], [u0 + 30, v0 + 30, 56], [u0 + 30, v0 + 10, 56]], '#5d564e')
    prism(u0 + 10, v0 + 10, u0 + 30, v0 + 30, 56, 104, '#7d756b')
    prism(u0 + 8, v0 + 8, u0 + 32, v0 + 32, 104, 108, '#6a635a')
    smoke(...P(u0 + 20, v0 + 20, 108), t)
    if (busy) glowAt(...P(u0 + 24, v0 + 24, 26), 44, 'rgba(255, 170, 70, 0.35)')
  },
  workbench(u0, v0, u1, v1) {
    table(u0, v0, u1, v1, 17, '#7a5434')
    prism(u0 + 3, v0 + 6, u1 - 3, v0 + 14, 17, 22, '#5d6068')
    line3([u0 + 6, v0 + 30, 17.5], [u1 - 2, v0 + 44, 17.5], '#7a5434', 2)
    prism(u1 - 6, v0 + 42, u1 - 1, v0 + 48, 17, 21, '#4a4a52')
    lines3([[[u0 + 4, v1 - 20, 17.5], [u1 - 3, v1 - 8, 17.5]], [[u0 + 6, v1 - 22, 17.5], [u1 - 2, v1 - 12, 17.5]]], '#4a4a52', 1.2)
    quad([[u0 + 4, v0 + 54, 17.4], [u1 - 4, v0 + 54, 17.4], [u1 - 4, v0 + 62, 17.4], [u0 + 4, v0 + 62, 17.4]], '#c8ccd4')
  },
  woodpile(u0, v0, u1, v1) {
    prism(u0, v0, u1, v1, 0, 16, '#8b5a2b')
    for (let z = 3; z < 16; z += 5) {
      for (let u = u0 + 3; u < u1 - 1; u += 5) {
        circle(...P(u + ((z / 5) % 2), v1 + 0.3, z), 2.4, '#d9b07a', '#7a5434')
      }
    }
  },
  anvil(u0, v0, u1, v1, t, busy) {
    prism(u0 + 5, v0 + 3, u1 - 5, v1 - 3, 0, 8, '#4a4a52')
    prism(u0, v0 + 1, u1, v1 - 1, 8, 14, '#62656f')
    quad([[u1, v0 + 3, 14], [u1 + 6, (v0 + v1) / 2, 13], [u1, v1 - 3, 10]], '#55585f')
    const [x, y] = P((u0 + u1) / 2, (v0 + v1) / 2, 15)
    if (busy) {
      sparks(x, y, t, 9, 18)
      glowAt(x, y, 14, 'rgba(255, 190, 90, 0.45)')
    } else {
      line3([u0 + 4, v0 + 4, 14.5], [u0 + 12, v0 + 8, 14.5], DARK_WOOD, 2)
    }
  },
  quench(u0, v0, u1, v1, t, busy) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    barrel(u, v, 7, 14)
    disk(u, v, 6, 14.1, '#5aa9d6')
    if (busy) {
      for (let k = 0; k < 3; k++) {
        const ph = (t * 0.6 + k / 3) % 1
        const [x, y] = P(u, v, 16 + ph * 26)
        circle(x + Math.sin(t * 2 + k) * 3, y, 2 + ph * 4, `rgba(240, 245, 250, ${0.55 * (1 - ph)})`)
      }
    }
  },
  weaponRack(u0, v0, u1, v1) {
    prism(u0, v0, u0 + 4, v0 + 5, 0, 40, DARK_WOOD)
    prism(u1 - 4, v0, u1, v0 + 5, 0, 40, DARK_WOOD)
    prism(u0, v0 + 1, u1, v0 + 4, 34, 37, '#7a5434')
    prism(u0, v0 + 1, u1, v0 + 4, 10, 12, '#7a5434')
    for (let u = u0 + 9, k = 0; u < u1 - 6; u += 10, k++) {
      const v = v1 - 3
      if (k % 3 === 0) {
        line3([u, v, 2], [u, v, 50], '#7a5434', 2)
        const [x, y] = P(u, v, 50)
        poly([[x, y - 8], [x - 2.5, y], [x + 2.5, y]], '#d5d9e0', '#8a8f99')
      } else if (k % 3 === 1) {
        line3([u, v, 4], [u, v, 36], '#c8ccd4', 2.5)
        line3([u - 4, v, 12], [u + 4, v, 12], '#c9a045', 2)
        line3([u, v, 4], [u, v, 11], '#5b3a24', 2)
      } else {
        line3([u, v, 2], [u, v, 40], '#7a5434', 2)
        quad([[u, v, 40], [u + 7, v, 43], [u + 7, v, 32], [u, v, 34]], '#b8c0cc', '#8a8f99')
      }
    }
  },
  crates(u0, v0, u1, v1) {
    const mid = v0 + 18
    prism(u0, v0, u1, mid - 1, 0, 14, '#a87a3e')
    prism(u0, mid, u1, v1, 0, 14, '#b98a4a')
    prism(u0 + 1, v0 + 8, u1 - 1, v0 + 26, 14, 26, '#c49a52')
    lines3([[[u1 + 0.2, v0, 0], [u1 + 0.2, mid - 1, 14]], [[u1 + 0.2, mid, 0], [u1 + 0.2, v1, 14]], [[u1 - 0.8, v0 + 8, 14], [u1 - 0.8, v0 + 26, 26]]], 'rgba(90, 60, 30, 0.6)', 1.2)
  },
  chest(u0, v0, u1, v1, t, busy) {
    prism(u0, v0, u1, v1, 0, 10, WOOD)
    for (const a of [u0 + 3, u1 - 5]) wallL(v1 + 0.2, a, a + 2, 0, 10, '#e0b441')
    if (busy) {
      flat(u0 + 1, v0 + 1, u1 - 1, v1 - 1, 10.1, '#3a2616')
      const [x, y] = P((u0 + u1) / 2, (v0 + v1) / 2, 11)
      glowAt(x, y, 16, `rgba(255, 215, 90, ${0.55 + 0.25 * Math.sin(t * 5)})`)
      for (let k = 0; k < 4; k++) circle(x - 7 + k * 5, y - 1 + (k % 2), 2, '#f2c94c', '#c79a2a')
      quad([[u0, v0, 10], [u1, v0, 10], [u1, v0 - 2, 22], [u0, v0 - 2, 22]], '#9b6b43', '#6b4a2e')
    } else {
      prism(u0, v0, u1, v1, 10, 15, '#9b6b43')
      wallL(v1 + 0.3, (u0 + u1) / 2 - 2, (u0 + u1) / 2 + 2, 7, 12, '#e0b441')
    }
  },
  dummy(u0, v0, u1, v1, t, busy) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    const w = busy ? Math.sin(t * 9) * 3 : 0
    disk(u, v, 5, 0, '#6b4a2e')
    line3([u, v, 0], [u + w, v - w, 30], '#6b4a2e', 3)
    line3([u - 9 + w, v + 9 - w, 24], [u + 9 + w, v - 9 - w, 24], '#6b4a2e', 2)
    const [x, y] = P(u + w, v - w, 20)
    ctx.beginPath()
    ctx.ellipse(x, y, 6, 8, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#d9b36a'
    ctx.fill()
    circle(...P(u + w, v - w, 34), 5, '#e3c27f')
  },
  armorStand(u0, v0, u1, v1) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    disk(u, v, 5, 0, DARK_WOOD)
    line3([u, v, 0], [u, v, 18], DARK_WOOD, 2)
    cyl(u, v, 5, 16, 32, '#b8c0cc')
    prism(u - 7, v - 3, u + 7, v + 3, 30, 33, '#9aa3b0')
    const [x, y] = P(u, v, 39)
    circle(x, y, 5.5, '#c8d0da', '#8a94a3')
    ctx.fillStyle = '#4a4f5a'
    ctx.fillRect(x - 4, y - 1, 8, 1.8)
  },
  coop(u0, v0, u1, v1, t, busy) {
    prism(u0, v0, u1, v1, 0, 26, '#9b6b43')
    quad([[u0 - 2, v1 + 2, 26], [u1 + 2, v1 + 2, 26], [u1 + 2, v0, 34], [u0 - 2, v0, 34]], '#7a4a2a')
    for (const z of [8, 18]) for (let u = u0 + 6; u < u1 - 3; u += 9) archL(v1 + 0.2, u - 2.5, u + 2.5, z - 3, z + 4, '#3a2616')
    for (const [a, c] of [[u0 + 8, '#f4f4f0'], [u0 + 20, '#b8bcc6']]) {
      const [x, y] = P(a, v1 + 4, 0)
      ctx.beginPath()
      ctx.ellipse(x, y - 3, 3.5, 2.6, 0, 0, Math.PI * 2)
      ctx.fillStyle = c
      ctx.fill()
      circle(x + 2.6, y - 5, 1.6, c)
    }
    if (busy) {
      const ph = (t * 0.45) % 1
      const [x, y] = P(u0 + 16, v1 + 10 + ph * 30, 30 + ph * 40)
      ctx.save()
      ctx.globalAlpha *= Math.min(1, (1 - ph) * 3)
      ctx.beginPath()
      ctx.ellipse(x, y, 3.5, 2.4, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#f4f4f0'
      ctx.fill()
      const flap = Math.sin(t * 18) * 3
      poly([[x - 1, y], [x - 6, y - 3 - flap], [x + 1, y - 1]], '#e6e6e0')
      poly([[x + 1, y], [x + 6, y - 3 - flap], [x - 1, y - 1]], '#e6e6e0')
      ctx.restore()
    }
  },
  telescope(u0, v0, u1, v1, t, busy) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    lines3([[[u, v, 22], [u0, v0 + 2, 0]], [[u, v, 22], [u1, v0, 0]], [[u, v, 22], [u - 2, v1, 0]]], DARK_WOOD, 1.8)
    const a = -0.6 + (busy ? Math.sin(t * 0.8) * 0.5 : 0)
    const tip = [u + Math.cos(a) * 14, v + Math.sin(a) * 14, 38]
    const tail = [u - Math.cos(a) * 6, v - Math.sin(a) * 6, 16]
    line3(tail, tip, '#c9a045', 5)
    line3(tip, [tip[0] + Math.cos(a) * 2, tip[1] + Math.sin(a) * 2, tip[2] + 1.2], '#8a6a2a', 6)
  },
  writingDesk(u0, v0, u1, v1, t, busy) {
    table(u0, v0, u1, v1, 16, '#7a5434')
    flat(u0 + 4, v0 + 3, u0 + 16, v0 + 12, 16.2, '#fbf6e6', '#d6c7a0')
    flat(u0 + 14, v0 + 5, u0 + 24, v1 - 3, 16.3, '#f3ecd8', '#d6c7a0')
    cyl(u1 - 5, v0 + 5, 1.8, 16, 20, '#2b2f38')
    const q = busy ? Math.sin(t * 10) * 1.5 : 0
    line3([u0 + 18 + q, v0 + 9, 16.6], [u0 + 24 + q, v0 + 4, 27], '#fbfbf6', 2)
    prism(u1 - 12, v1 - 6, u1 - 3, v1 - 3, 16, 18.5, '#d9b07a')
  },
  crystal(u0, v0, u1, v1, t, busy) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    prism(u0 + 3, v0 + 3, u1 - 3, v1 - 3, 0, 14, '#8c8fa6')
    const [x, y] = P(u, v, 21)
    const pulse = 0.5 + 0.5 * Math.sin(t * (busy ? 5 : 1.6))
    glowAt(x, y, busy ? 18 : 11, `rgba(170, 140, 255, ${0.25 + 0.35 * pulse})`)
    const grad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 7)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.5, busy ? '#b9a5ff' : '#a8b8e8')
    grad.addColorStop(1, '#6b4fd0')
    ctx.beginPath()
    ctx.arc(x, y, 7, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
  },
  mapTable(u0, v0, u1, v1, t, busy) {
    table(u0, v0, u1, v1, 15, '#7a5434')
    flat(u0 + 3, v0 + 3, u1 - 3, v1 - 3, 15.2, '#efd9a0', '#c9a66b')
    lines3([[[u0 + 8, v0 + 30, 15.4], [u0 + 24, v0 + 22, 15.4]], [[u0 + 24, v0 + 22, 15.4], [u0 + 34, v0 + 32, 15.4]], [[u0 + 34, v0 + 32, 15.4], [u1 - 8, v0 + 26, 15.4]]], 'rgba(63, 111, 181, 0.8)', 1.6)
    for (const [a, b] of [[u0 + 14, v0 + 10], [u0 + 22, v0 + 12], [u1 - 14, v1 - 12]]) {
      const [x, y] = P(a, b, 15.4)
      poly([[x, y - 5], [x - 4, y + 1], [x + 4, y + 1]], '#8a7a5a')
    }
    const hop = k => (busy ? Math.abs(Math.sin(t * 4 + k * 1.3)) * 4 : 0)
    const marks = [[u0 + 18, v1 - 12, '#c0392b'], [u1 - 18, v0 + 12, '#2f62c9'], [(u0 + u1) / 2, (v0 + v1) / 2, '#3f8f4f']]
    marks.forEach(([a, b, c], k) => cyl(a, b, 2.2, 15.3 + hop(k), 21 + hop(k), c))
    lines3([[[(u0 + u1) / 2 - 5, v1 - 14, 15.5], [(u0 + u1) / 2 + 1, v1 - 8, 15.5]], [[(u0 + u1) / 2 - 5, v1 - 8, 15.5], [(u0 + u1) / 2 + 1, v1 - 14, 15.5]]], '#c0392b', 1.5)
    for (const [a, b] of [[u0 + 4, v1 - 4], [u1 - 4, v0 + 4]]) {
      cyl(a, b, 1.3, 15, 21, '#f6efdc')
      flame(...P(a, b, 22), t, 0.6)
    }
  },
  flagStand(u0, v0, u1, v1, t) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    disk(u, v, 4, 0, DARK_WOOD)
    line3([u, v, 0], [u, v, 50], '#5a4030', 2)
    waveFlag(...P(u, v, 50), 16, 10, t, '#c94a3a')
  },
  counter(u0, v0, u1, v1, t, busy) {
    prism(u0, v0, u1, v1, 0, 18, '#7a4a2a')
    for (let u = u0 + 10; u < u1 - 4; u += 18) wallL(v1 + 0.2, u, u + 12, 3, 15, '#6a3e22')
    prism(u0 - 1, v0, u1 + 1, v1 + 2, 18, 21, '#a0683a')
    for (let u = u0 + 12; u < u1 - 8; u += 22) mug(u, v1 - 4, 21)
    cyl(u0 + 30, v0 + 8, 2, 21, 30, '#c9a045')
    line3([u0 + 30, v0 + 8, 29], [u0 + 30, v0 + 13, 29], '#c9a045', 2)
    if (busy) {
      const ph = (t * 0.9) % 1
      const [x, y] = P(u0 + 30, v0 + 13, 28 - ph * 7)
      circle(x, y, 1.2, `rgba(232, 194, 90, ${1 - ph})`)
    }
  },
  barrels(u0, v0, u1, v1) {
    barrel(u0 + 8, v0 + 8, 7, 18)
    barrel(u0 + 18, v0 + 9, 7, 18)
    barrel(u0 + 9, v0 + 18, 7, 18)
    barrel(u0 + 12, v0 + 12, 6, 15)
  },
  fireplace(u0, v0, u1, v1, t, busy) {
    prism(u0, v0, u1, v1, 0, 40, '#9a8f80')
    lines3([[[u1 + 0.2, v0, 13], [u1 + 0.2, v1, 13]], [[u1 + 0.2, v0, 27], [u1 + 0.2, v1, 27]]], 'rgba(40, 30, 20, 0.25)', 1)
    prism(u0, v0 + 6, u1 - 5, v1 - 6, 43, WALL_H, '#9a8f80')
    prism(u0, v0 - 2, u1 + 2, v1 + 2, 40, 43, DARK_WOOD)
    const vc = (v0 + v1) / 2
    archR(u1 + 0.2, v0 + 8, v1 - 8, 0, 28, '#2a1d16')
    for (let k = -1; k <= 1; k++) flame(...P(u1 + 0.4, vc + k * 6, 2), t + k, busy ? 1.5 : 1.1)
    glowAt(...P(u1 + 4, vc, 8), busy ? 34 : 24, 'rgba(255, 170, 70, 0.3)')
    mug(u0 + 6, v0 + 4, 43)
  },
  roundTable(u0, v0, u1, v1, t) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    cyl(u, v, 2.2, 0, 12, DARK_WOOD)
    cyl(u, v, 11, 12, 14.5, WOOD)
    mug(u - 4, v + 2, 14.5)
    mug(u + 4, v - 3, 14.5)
    flat(u - 2, v - 6, u + 3, v - 2, 14.6, '#e0b441')
  },
  cabinet(u0, v0, u1, v1) {
    prism(u0, v0, u1, v1, 0, 30, '#8b6440')
    for (const z of [2, 11, 20]) {
      wallL(v1 + 0.2, u0 + 2, u1 - 2, z, z + 7.5, '#a07850')
      line3([(u0 + u1) / 2 - 3, v1 + 0.4, z + 4], [(u0 + u1) / 2 + 3, v1 + 0.4, z + 4], '#4a3520', 1.5)
    }
    prism(u0 + 4, v0 + 2, u0 + 14, v0 + 10, 30, 33, '#3f6fb5')
  },
  waitBench(u0, v0, u1, v1) {
    for (const b of [v0 + 3, v1 - 6]) prism(u0 + 2, b, u1 - 2, b + 3, 0, 8, '#6b4a2e')
    prism(u0, v0, u0 + 3, v1, 8, 24, '#8a5a35')
    prism(u0 + 3, v0, u1, v1, 8, 11, '#9b6b43')
  },
  clerkDesk(u0, v0, u1, v1, t, busy) {
    prism(u0, v0, u1, v1, 0, 22, '#7a5434')
    wallL(v1 + 0.2, u0 + 4, u1 - 4, 4, 18, '#8b6440', '#c9a045')
    wallR(u1 + 0.2, v0 + 3, v1 - 3, 4, 18, '#6f4b30')
    prism(u0 - 1, v0 - 1, u1 + 1, v1 + 1, 22, 25, '#9b6b43')
    flat(u0 + 6, v0 + 4, u0 + 22, v0 + 14, 25.2, '#fbf6e6', '#d6c7a0')
    prism(u0 + 26, v0 + 4, u0 + 38, v0 + 13, 25, 28, '#3f6fb5')
    const ring = busy ? Math.sin(t * 16) * 0.35 : 0
    const [x, y] = P(u1 - 8, v1 - 6, 25)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(ring)
    ctx.beginPath()
    ctx.ellipse(0, -2, 3.6, 4, 0, Math.PI, 0)
    ctx.fillStyle = '#e0b441'
    ctx.fill()
    ctx.fillRect(-4.5, -2, 9, 1.6)
    ctx.restore()
    line3([u1 - 18, v0 + 6, 25.3], [u1 - 14, v0 + 2, 34], '#fbfbf6', 1.6)
  },
  portal(u0, v0, u1, v1, t) {
    prism(u0 + 4, v0 + 4, u1 - 4, v1 - 4, 0, 6, '#6f7390')
    const [cx, cy] = P((u0 + u1) / 2, (v0 + v1) / 2, 36)
    const power = 0.35 + 0.65 * portalPower
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26)
    grad.addColorStop(0, `rgba(255, 255, 255, ${0.2 + 0.6 * power})`)
    grad.addColorStop(0.4, `rgba(140, 110, 255, ${0.5 + 0.4 * power})`)
    grad.addColorStop(1, `rgba(60, 200, 255, ${0.35 + 0.5 * power})`)
    ctx.beginPath()
    ctx.ellipse(cx, cy, 17, 26, 0, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.lineWidth = 1.5
    for (let k = 0; k < 3; k++) {
      const a = t * (2 + k) * (0.6 + power) + k * 2
      ctx.beginPath()
      ctx.ellipse(cx, cy, 14 - k * 4, 22 - k * 6, 0, a, a + Math.PI * 1.2)
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 * power})`
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.ellipse(cx, cy, 22, 31, 0, 0, Math.PI * 2)
    ctx.ellipse(cx, cy, 17, 26, 0, 0, Math.PI * 2, true)
    ctx.fillStyle = '#6f7390'
    ctx.fill()
    ctx.strokeStyle = '#555872'
    ctx.lineWidth = 1
    ctx.stroke()
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4
      circle(cx + Math.cos(a) * 19.5, cy + Math.sin(a) * 28.5, 1.6, `rgba(155, 231, 255, ${power})`)
    }
  },
  menhir(u0, v0, u1, v1) {
    const u = (u0 + u1) / 2
    const v = (v0 + v1) / 2
    quad([[u - 6, v + 5, 0], [u + 5, v + 5, 0], [u + 3, v + 4, 30], [u - 4, v + 4, 32]], '#8c8fa6')
    quad([[u + 5, v - 6, 0], [u + 5, v + 5, 0], [u + 3, v + 4, 30], [u + 4, v - 4, 29]], '#6f7288')
    quad([[u - 4, v - 4, 31], [u + 4, v - 4, 29], [u + 3, v + 4, 30], [u - 4, v + 4, 32]], '#a3a6bb')
    wallL(v + 4.8, u - 1.5, u + 1.5, 8, 24, `rgba(155, 231, 255, ${0.4 + 0.6 * portalPower})`)
  },
}

function gatePosts(gate) {
  const a = GATE_AT - GATE_W / 2 - 3
  const b = GATE_AT + GATE_W / 2 + 3
  return gate === 'right' ? [[CELL - 3, a], [CELL - 3, b]] : [[a, CELL - 3], [b, CELL - 3]]
}

function gatePost(u, v) {
  prism(u - 3.5, v - 3.5, u + 3.5, v + 3.5, 0, 22, '#c9bfa9')
  prism(u - 4.5, v - 4.5, u + 4.5, v + 4.5, 22, 25, '#a99f8a')
}

function stubs(room) {
  const g0 = GATE_AT - GATE_W / 2
  const g1 = GATE_AT + GATE_W / 2
  const right = room.gate === 'right' ? [[CELL - WALL_T, WALL_T, CELL, g0], [CELL - WALL_T, g1, CELL, CELL]] : [[CELL - WALL_T, WALL_T, CELL, CELL]]
  const bottom = room.gate === 'bottom' ? [[WALL_T, CELL - WALL_T, g0, CELL], [g1, CELL - WALL_T, CELL - WALL_T, CELL]] : [[WALL_T, CELL - WALL_T, CELL - WALL_T, CELL]]
  const pieces = [...right, ...bottom].sort((a, b) => a[0] + a[1] + a[2] + a[3] - (b[0] + b[1] + b[2] + b[3]))
  for (const [u0, v0, u1, v1] of pieces) {
    wallL(v1, u0, u1, 0, STUB_H, shade(room.wall, 0.86))
    wallR(u1, v0, v1, 0, STUB_H, shade(room.wall, 0.72))
    flat(u0, v0, u1, v1, STUB_H, CUT, 'rgba(120, 100, 80, 0.4)')
  }
  for (const [u, v] of gatePosts(room.gate)) gatePost(u, v)
}

function lamp(u, v) {
  line3([u, v, 0], [u, v, 34], '#3d4350', 2)
  prism(u - 3, v - 3, u + 3, v + 3, 34, 41, '#f7d774')
  prism(u - 4, v - 4, u + 4, v + 4, 41, 43, '#3d4350')
}

function fountain(t) {
  cyl(90, 90, 38, 0, 10, '#c9c4b8')
  disk(90, 90, 33, 10, '#78c0ea')
  for (let k = 0; k < 3; k++) {
    const r = (t * 12 + k * 11) % 33
    disk(90, 90, r, 10, null, `rgba(255, 255, 255, ${0.5 * (1 - r / 33)})`)
  }
  cyl(90, 90, 5, 10, 34, '#d6d1c4')
  cyl(90, 90, 15, 30, 35, '#cfc9bb')
  disk(90, 90, 12, 35, '#8ccdf2')
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4
    for (let i = 0; i < 5; i++) {
      const s = (t * 1.2 + i / 5 + k * 0.07) % 1
      const reach = 14 + s * 15
      circle(...P(90 + Math.cos(a) * reach, 90 + Math.sin(a) * reach, 36 + s * 6 - s * s * 32), 1.3, 'rgba(225, 243, 255, 0.9)')
    }
  }
  const [x, y] = P(90, 90, 40)
  circle(x, y - Math.abs(Math.sin(t * 6)) * 2, 2.5, '#e8f6ff')
}

const PLAZA_LAMPS = [[20, 92], [92, 20], [164, 92], [92, 164]]

function plazaItems() {
  return [{ depth: 180, paint: fountain }, ...PLAZA_LAMPS.map(([u, v]) => ({ depth: u + v, paint: () => lamp(u, v) }))].sort((a, b) => a.depth - b.depth)
}

const furnitureCache = {}

function furnitureOf(key) {
  if (furnitureCache[key]) return furnitureCache[key]
  const all = FURNITURE[key].map(([u0, v0, u1, v1, name], i) => ({ id: `${key}@${i}:${name}`, box: [u0, v0, u1, v1], name }))
  const back = all.filter(f => f.box[0] <= WALL_T || f.box[1] <= WALL_T).sort((a, b) => a.box[0] + a.box[1] + a.box[2] + a.box[3] - (b.box[0] + b.box[1] + b.box[2] + b.box[3]))
  const center = all.filter(f => !back.includes(f))
  furnitureCache[key] = { back, center }
  return furnitureCache[key]
}

function paintFurniture(item, t, busy) {
  FURN[item.name](...item.box, t, busy)
}

function paintBack(room, t, busy) {
  UNDER[room.key]?.(t)
  shell(room)
  LOOKS[room.key]?.(t, busy)
  for (const item of furnitureOf(room.key).back) paintFurniture(item, t, busy)
}

function drawPerson(sprite, t, ghost = false) {
  const actor = sprite.data
  const style = styleFor(actor)
  const [sx, sy] = project(sprite.x, sprite.y)
  const swing = sprite.moving ? Math.sin(t * 12 + sprite.phase) : 0
  const bob = sprite.moving ? Math.abs(swing) * 1.6 : Math.sin(t * 2 + sprite.phase) * 0.4
  const pump = actor.status === 'working' && !sprite.moving ? Math.sin(t * 10 + sprite.phase) : swing
  const cap = style.cap ?? style.body
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, sprite.alpha)) * (ghost ? GHOST : 1)
  ctx.translate(sx, sy)
  ctx.fillStyle = 'rgba(20, 30, 40, 0.24)'
  ctx.beginPath()
  ctx.ellipse(0, 0, 11, 4.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.scale(sprite.face || 1, 1)
  ctx.translate(0, -bob)
  if (style.gear === 'crown') poly([[-8, -30], [8, -30], [13, -5], [-13, -5]], shade('#b8463a', 1))
  if (style.gear === 'hood') poly([[-9, -32], [9, -32], [11, -9], [-11, -9]], shade(cap, 0.8))
  ctx.fillStyle = '#3b3f4c'
  rr(-6 + swing * 2.5, -13, 5, 13, 2)
  ctx.fill()
  rr(1 - swing * 2.5, -13, 5, 13, 2)
  ctx.fill()
  box(-12.5, -27 - pump * 2, 5, 12, shade(style.body, 0.78), null, 2.5)
  box(-9, -28, 18, 17, style.body, null, 6)
  ctx.fillStyle = shade(style.body, 0.62)
  ctx.fillRect(-9, -16, 18, 2.5)
  box(7.5, -27 + pump * 2, 5, 12, shade(style.body, 0.9), null, 2.5)
  circle(10, -15 + pump * 2, 2.6, '#f6d7b8')
  if (actor.main) {
    ctx.font = `800 9px ${FONT}`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('✳', 0, -18)
  }
  circle(0, -39, 12, '#f6d7b8', '#e2b994')
  ctx.fillStyle = style.hair
  ctx.beginPath()
  ctx.arc(0, -41, 12, Math.PI, 0)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(4, -46, 7, 3.5, -0.3, 0, Math.PI * 2)
  ctx.fill()
  circle(1, -38, 1.5, '#272b33')
  circle(6.5, -38, 1.5, '#272b33')
  circle(-1.5, -34.5, 1.6, 'rgba(240, 130, 120, 0.45)')
  circle(9, -34.5, 1.6, 'rgba(240, 130, 120, 0.45)')
  if (style.glasses) {
    ctx.strokeStyle = '#272b33'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(1, -38, 2.8, 0, Math.PI * 2)
    ctx.moveTo(9.3, -38)
    ctx.arc(6.5, -38, 2.8, 0, Math.PI * 2)
    ctx.moveTo(3.8, -38)
    ctx.lineTo(3.7, -38)
    ctx.stroke()
  }
  drawGear(style.gear, cap, t)
  if (actor.status === 'resting') {
    ctx.font = `700 9px ${FONT}`
    ctx.fillStyle = 'rgba(90, 100, 120, 0.8)'
    ctx.textAlign = 'left'
    const ph = (t * 0.6 + sprite.phase) % 1
    ctx.fillText('z', 12 + ph * 6, -48 - ph * 10)
  }
  ctx.restore()
}

function drawGear(gear, cap, t) {
  switch (gear) {
    case 'crown':
      poly([[-8, -50], [-8, -57], [-4, -53], [0, -59], [4, -53], [8, -57], [8, -50]], '#f2c94c', '#c79a2a')
      circle(0, -53.5, 1.4, '#d64545')
      break
    case 'hood':
      ctx.fillStyle = cap
      ctx.beginPath()
      ctx.arc(0, -40, 13.5, Math.PI * 0.92, Math.PI * 0.08)
      ctx.lineTo(10, -33)
      ctx.lineTo(13, -36)
      ctx.arc(0, -40, 13.5, Math.PI * 0.08, Math.PI * 0.92, true)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, -41, 13.5, Math.PI, 0)
      ctx.lineTo(9, -44)
      ctx.quadraticCurveTo(2, -50, -6, -45)
      ctx.lineTo(-12, -38)
      ctx.closePath()
      ctx.fill()
      break
    case 'wizard':
      ctx.fillStyle = cap
      ctx.beginPath()
      ctx.ellipse(0, -48, 16, 4.5, 0, 0, Math.PI * 2)
      ctx.fill()
      poly([[-10, -49], [10, -49], [5 + Math.sin(t * 2) * 1.5, -74]], cap)
      circle(1, -60, 1.8, '#f2c94c')
      break
    case 'helm':
      ctx.fillStyle = '#b8c0cc'
      ctx.beginPath()
      ctx.arc(0, -42, 13, Math.PI, 0)
      ctx.lineTo(13, -40)
      ctx.lineTo(-13, -40)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#8f98a6'
      ctx.fillRect(2, -42, 2.4, 9)
      poly([[-3, -54], [3, -54], [-1, -62], [-7, -60]], '#d64545')
      break
    case 'scholar':
      poly([[-14, -51], [0, -56], [14, -51], [0, -46]], cap)
      ctx.fillStyle = cap
      ctx.fillRect(-8, -50, 16, 5)
      line([10, -51], [12, -42], '#f2c94c', 1.2)
      break
    case 'feather':
      ctx.fillStyle = cap
      ctx.beginPath()
      ctx.arc(0, -42, 12.5, Math.PI, 0)
      ctx.closePath()
      ctx.fill()
      ctx.fillRect(4, -44, 13, 3)
      ctx.fillStyle = '#f2c94c'
      ctx.beginPath()
      ctx.ellipse(-8, -55, 3, 9, -0.6 + Math.sin(t * 3) * 0.08, 0, Math.PI * 2)
      ctx.fill()
      break
    default:
      break
  }
}

function line(a, b, color, width) {
  ctx.beginPath()
  ctx.moveTo(...a)
  ctx.lineTo(...b)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

function speechFor(actor, now) {
  const bubble = actor.bubble
  if (bubble && bubble.kind === 'error' && now - bubble.at < ERROR_S) return ['error', `😓 ${bubble.text}`, 1]
  if (bubble && bubble.kind === 'say' && (actor.status === 'talking' || actor.status === 'waiting') && now - bubble.at < SAY_S) {
    return ['say', `💬 ${bubble.text}`, actor.main ? 3 : 1]
  }
  return null
}

function activityFor(actor, t) {
  switch (actor.status) {
    case 'working': return `${ROOMS[roomOf(actor.room)].icon} ${actor.detail || STATUS_LABELS.working}`
    case 'thinking': return `💭 고민 중${'.'.repeat(1 + (Math.floor(t * 2) % 3))}`
    case 'talking': return '💬 말하는 중'
    case 'received': return '📨 요청 받음'
    case 'leaving': return '🌀 귀환합니다!'
    case 'resting': return '💤 쉬는 중'
    default: return actor.main ? '⌨️ 입력 기다리는 중' : '📝 보고 정리 중'
  }
}

function cardOf(sprite, cam, now, t) {
  const actor = sprite.data
  const compact = cam.width < COMPACT_W
  const brief = compact && !actor.main
  const pad = 6
  const maxW = compact ? 150 : 212
  const status = STATUS_LABELS[actor.status] ?? actor.status
  ctx.font = `700 ${compact ? 10 : 11}px ${FONT}`
  const name = clipText(actor.name, compact ? 64 : 96)
  const nameW = ctx.measureText(name).width
  ctx.font = `700 9px ${FONT}`
  const pillW = ctx.measureText(status).width + 10
  ctx.font = `500 ${compact ? 9.5 : 10}px ${FONT}`
  const elapsed = compact ? '' : span(now - actor.since)
  const elapsedW = elapsed ? ctx.measureText(elapsed).width + 6 : 0
  const head = 10 + nameW + 6 + pillW + elapsedW
  const doing = activityFor(actor, t)
  const doingW = brief ? 0 : Math.min(ctx.measureText(doing).width, maxW - pad * 2)
  const foot = compact ? '' : `🔧 도구 ${actor.tools ?? 0}회`
  const footW = foot ? ctx.measureText(foot).width + (ACTIVE.has(actor.status) ? 48 : 0) : 0
  const w = Math.ceil(Math.min(maxW, Math.max(brief ? 0 : compact ? 84 : 120, head, doingW, footW) + pad * 2))
  const h = brief ? 20 : compact ? 32 : 46
  let speech = null
  const found = speechFor(actor, now)
  if (found) {
    const [tone, text, lines] = found
    ctx.font = `600 ${compact ? 10 : 11}px ${FONT}`
    const width = actor.main ? (compact ? 180 : 240) : (compact ? 140 : 170)
    const rows = wrapText(text, width, lines)
    speech = { tone, rows, w: Math.ceil(Math.max(...rows.map(row => ctx.measureText(row).width)) + 16), h: rows.length * (compact ? 13 : 15) + 8 }
  }
  return { sprite, actor, compact, brief, name, status, elapsed, doing, foot, cw: w, ch: h, speech, pad }
}

const CARD_SPOTS = [[0, 0], [0.55, 0], [-0.55, 0], [0, -1], [0.6, -1], [-0.6, -1], [1.1, 0], [-1.1, 0], [1.1, -1], [-1.1, -1], [0, -2], [0.6, -2], [-0.6, -2], [0, 'below'], [0.6, 'below'], [-0.6, 'below']]

function placeBoxes(items, width, height, obstacles = []) {
  const taken = obstacles.map(r => ({ ...r, weight: r.weight ?? 0.25 }))
  return items.map(({ ax, ay, fy, w, h }) => {
    const fit = (x, y) => [Math.max(4, Math.min(width - w - 4, x)), Math.max(4, Math.min(height - h - 4, y))]
    let best = null
    CARD_SPOTS.forEach(([dx, dy], rank) => {
      const top = dy === 'below' ? fy + 6 : ay - h - 4 + dy * (h + 6)
      const [x, y] = fit(ax - w / 2 + dx * w, top)
      let cost = rank * 0.06 * w * h
      for (const r of taken) {
        cost += r.weight * Math.max(0, Math.min(x + w, r.x + r.w) - Math.max(x, r.x)) * Math.max(0, Math.min(y + h, r.y + r.h) - Math.max(y, r.y))
      }
      if (!best || cost < best.cost) best = { x, y, cost }
    })
    const placed = { x: best.x, y: best.y, w, h }
    taken.push({ ...placed, weight: 3 })
    const moved = Math.abs(best.x + w / 2 - ax) > w * 0.3 || best.y + h < ay - h * 0.6 || best.y > ay
    return { ...placed, moved }
  })
}

function plateOf(key, room, cam, count) {
  const compact = cam.width < COMPACT_W
  const [ax, ay] = toScreen(cam, room.origin[0] + WALL_T / 2, room.origin[1] + WALL_T / 2, WALL_H - 12)
  ctx.font = `700 ${compact ? 10 : 11}px ${FONT}`
  const title = `${room.icon} ${room.label}`
  let w = ctx.measureText(title).width + 14
  let en = ''
  if (!compact) {
    ctx.font = `600 8.5px ${FONT}`
    en = room.en
    w += ctx.measureText(en).width + 6
  }
  const badge = count ? (compact ? 16 : 18) : 0
  w = Math.ceil(w + badge)
  const h = compact ? 17 : 20
  const x = Math.max(4, Math.min(cam.width - w - 4, ax - w / 2))
  const y = Math.max(4, Math.min(cam.height - h - 4, ay - h / 2))
  return { key, title, en, count, compact, x, y, w, h }
}

function plateLayout(cam) {
  const counts = {}
  for (const sprite of sprites.values()) if (sprite.data && !sprite.gone && sprite.slot >= 0) counts[sprite.room] = (counts[sprite.room] ?? 0) + 1
  return Object.entries(plan.rooms).map(([key, room]) => plateOf(key, room, cam, counts[key] ?? 0))
}

function cardLayout(cam, now, t) {
  const list = [...sprites.values()].filter(sprite => sprite.data && sprite.alpha > 0.05)
    .sort((p, q) => Number(Boolean(q.data.main)) - Number(Boolean(p.data.main)) || q.x + q.y - (p.x + p.y))
  const cards = list.map(sprite => cardOf(sprite, cam, now, t))
  const items = cards.map(card => {
    const [ax, ay] = toScreen(cam, card.sprite.x, card.sprite.y, BODY_H + 12)
    const [, fy] = toScreen(cam, card.sprite.x, card.sprite.y)
    const extra = card.speech ? card.speech.h + 8 : 0
    return { ax, ay, fy, w: Math.max(card.cw, card.speech ? card.speech.w : 0), h: card.ch + extra }
  })
  const plates = plateLayout(cam)
  const spots = placeBoxes(items, cam.width, cam.height, plates)
  return cards.map((card, i) => ({ ...card, ...spots[i], ax: items[i].ax, ay: items[i].ay, fy: items[i].fy }))
}

function drawPlate(plate) {
  const { x, y, w, h, compact } = plate
  box(x, y, w, h, 'rgba(255, 249, 232, 0.95)', '#c9a66b', 6)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.font = `700 ${compact ? 10 : 11}px ${FONT}`
  ctx.fillStyle = '#4a3520'
  ctx.fillText(plate.title, x + 7, y + h / 2 + 0.5)
  let cursor = x + 7 + ctx.measureText(plate.title).width
  if (plate.en) {
    ctx.font = `600 8.5px ${FONT}`
    ctx.fillStyle = '#9a7a46'
    ctx.fillText(plate.en, cursor + 6, y + h / 2 + 0.5)
    cursor += 6 + ctx.measureText(plate.en).width
  }
  if (plate.count) {
    const r = compact ? 6.5 : 7.5
    circle(x + w - r - 4, y + h / 2, r, '#d97757')
    ctx.font = `800 ${compact ? 8.5 : 9.5}px ${FONT}`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText(String(plate.count), x + w - r - 4, y + h / 2 + 0.5)
  }
  ctx.textBaseline = 'alphabetic'
}

function drawCard(card, t) {
  const { actor, compact, pad } = card
  const w = card.cw
  const x = card.x + (card.w - w) / 2
  const style = styleFor(actor)
  ctx.save()
  ctx.globalAlpha = Math.max(0, Math.min(1, card.sprite.alpha))
  if (card.moved) {
    const below = card.y > card.fy
    ctx.strokeStyle = 'rgba(70, 60, 40, 0.7)'
    ctx.lineWidth = 1.2
    ctx.setLineDash([4, 2])
    ctx.beginPath()
    ctx.moveTo(Math.max(card.x + 6, Math.min(card.x + card.w - 6, card.ax)), below ? card.y : card.y + card.h)
    ctx.lineTo(card.ax, below ? card.fy : card.ay + 8)
    ctx.stroke()
    ctx.setLineDash([])
  }
  let top = card.y
  if (card.speech) {
    const sp = card.speech
    const [bg, border, color] = BUBBLE_TONES[sp.tone]
    const sx = card.x + (card.w - sp.w) / 2
    box(sx, top, sp.w, sp.h, bg, border, 8)
    poly([[x + w / 2 - 5, top + sp.h - 0.5], [x + w / 2, top + sp.h + 6], [x + w / 2 + 5, top + sp.h - 0.5]], bg)
    ctx.font = `600 ${compact ? 10 : 11}px ${FONT}`
    ctx.fillStyle = color
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    sp.rows.forEach((row, i) => ctx.fillText(row, sx + 8, top + (compact ? 14 : 16) + i * (compact ? 13 : 15) - 2))
    top += sp.h + 8
  }
  ctx.shadowColor = 'rgba(30, 40, 30, 0.18)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 1
  box(x, top, w, card.ch, 'rgba(255, 255, 255, 0.95)', '#d8d2c2', 7)
  ctx.shadowColor = 'transparent'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  const row1 = top + 10
  circle(x + pad + 3, row1, 3.2, style.body)
  ctx.font = `700 ${compact ? 10 : 11}px ${FONT}`
  ctx.fillStyle = '#2b2f38'
  ctx.fillText(card.name, x + pad + 10, row1 + 0.5)
  const [pillBg, pillFg] = STATUS_TONES[actor.status] ?? STATUS_TONES.waiting
  ctx.font = `700 9px ${FONT}`
  const pillW = ctx.measureText(card.status).width + 10
  const pillX = x + pad + 10 + (() => { ctx.font = `700 ${compact ? 10 : 11}px ${FONT}`; return ctx.measureText(card.name).width })() + 6
  box(pillX, row1 - 6.5, pillW, 13, pillBg, null, 6.5)
  ctx.font = `700 9px ${FONT}`
  ctx.fillStyle = pillFg
  ctx.fillText(card.status, pillX + 5, row1 + 0.5)
  ctx.font = `500 ${compact ? 9.5 : 10}px ${FONT}`
  if (card.elapsed) {
    ctx.fillStyle = '#8a8f9a'
    ctx.textAlign = 'right'
    ctx.fillText(card.elapsed, x + w - pad, row1 + 0.5)
    ctx.textAlign = 'left'
  }
  if (!card.brief) {
    ctx.fillStyle = '#3d4452'
    ctx.fillText(clipText(card.doing, w - pad * 2), x + pad, top + (compact ? 23 : 24))
  }
  if (card.foot) {
    ctx.fillStyle = '#7a808c'
    ctx.fillText(card.foot, x + pad, top + 37)
    if (ACTIVE.has(actor.status)) {
      const bx = x + w - pad - 40
      box(bx, top + 35, 40, 4, '#ece7da', null, 2)
      ctx.save()
      rr(bx, top + 35, 40, 4, 2)
      ctx.clip()
      const run = ((t * 0.9 + card.sprite.phase) % 1) * 56 - 16
      ctx.fillStyle = pillFg
      ctx.fillRect(bx + run, top + 35, 16, 4)
      ctx.restore()
    }
  }
  ctx.textBaseline = 'alphabetic'
  ctx.restore()
}

function rectBox([x, y, w, h]) {
  return [x, y, x + w, y + h]
}

function behind(a, b) {
  return a[2] <= b[0] || a[3] <= b[1]
}

function paintOrder(items) {
  const n = items.length
  const indeg = new Array(n).fill(0)
  const out = items.map(() => [])
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && behind(items[i].box, items[j].box) && !behind(items[j].box, items[i].box)) {
        out[i].push(j)
        indeg[j]++
      }
    }
  }
  const key = item => item.box[0] + item.box[1] + item.box[2] + item.box[3]
  const done = new Array(n).fill(false)
  const order = []
  while (order.length < n) {
    let pick = -1
    for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (pick < 0 || key(items[i]) < key(items[pick]))) pick = i
    if (pick < 0) for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || key(items[i]) < key(items[pick]))) pick = i
    done[pick] = true
    order.push(items[pick])
    for (const j of out[pick]) indeg[j]--
  }
  return order
}

function busyRooms() {
  const out = new Set()
  for (const sprite of sprites.values()) {
    if (sprite.data && !sprite.gone && !sprite.moving && sprite.slot >= 0 && ACTIVE.has(sprite.data.status)) out.add(sprite.room)
  }
  return out
}

function sceneSteps() {
  const busy = busyRooms()
  const members = {}
  const loose = []
  for (const sprite of sprites.values()) {
    if (!sprite.data) continue
    const key = where(sprite.x, sprite.y)
    if (key) (members[key] ??= []).push(sprite)
    else loose.push(sprite)
  }
  const pointBox = sprite => [sprite.x, sprite.y, sprite.x, sprite.y]
  const containers = [
    ...Object.values(plan.rooms).map(room => ({ room, box: rectBox(room.rect) })),
    { plaza: plan.plaza, box: rectBox(plan.plaza.rect) },
    ...loose.map(sprite => ({ sprite, box: pointBox(sprite) })),
  ]
  const steps = []
  for (const c of paintOrder(containers)) {
    if (c.sprite) {
      steps.push({ id: c.sprite.id, sprite: c.sprite })
      continue
    }
    if (c.plaza) {
      steps.push({ id: 'plaza', origin: c.plaza.origin, paint: t => { for (const item of plazaItems()) item.paint(t) } })
      continue
    }
    const room = c.room
    const on = busy.has(room.key)
    const [ox, oy] = room.origin
    steps.push({ id: `${room.key}:back`, stage: 'back', room: room.key, origin: room.origin, paint: t => paintBack(room, t, on) })
    const inside = [
      ...furnitureOf(room.key).center.map(item => ({ item, box: [ox + item.box[0], oy + item.box[1], ox + item.box[2], oy + item.box[3]] })),
      ...(members[room.key] ?? []).map(sprite => ({ sprite, box: pointBox(sprite) })),
    ]
    for (const entry of paintOrder(inside)) {
      if (entry.sprite) steps.push({ id: entry.sprite.id, sprite: entry.sprite, room: room.key })
      else steps.push({ id: entry.item.id, room: room.key, origin: room.origin, paint: t => paintFurniture(entry.item, t, on) })
    }
    steps.push({ id: `${room.key}:front`, stage: 'front', room: room.key, origin: room.origin, paint: () => stubs(room) })
  }
  return steps
}

function ghostsOf(steps) {
  const walls = []
  steps.forEach((step, i) => {
    if (step.stage === 'back') walls.push([i, plan.rooms[step.room].hulls])
  })
  const hidden = []
  steps.forEach((step, i) => {
    const sprite = step.sprite
    if (!sprite || sprite.alpha <= 0.05) return
    const { x, y } = sprite
    const [cx, cy] = project(x, y, BODY_H / 2)
    const samples = [project(x, y, 2), project(x, y, BODY_H), [cx, cy], [cx - 10, cy], [cx + 10, cy]]
    if (walls.some(([at, hulls]) => at > i && hulls.some(hull => samples.some(([sx, sy]) => insideHull(hull, sx, sy))))) hidden.push(sprite)
  })
  return hidden
}

function pickPlot(px, py) {
  if (!(view.scale > 0)) return null
  const x = (px - view.ox) / view.scale
  const y = (py - view.oy) / view.scale
  const rooms = Object.values(plan.rooms).sort((a, b) => b.origin[0] + b.origin[1] - (a.origin[0] + a.origin[1]))
  for (const room of rooms) if (room.hulls.some(hull => insideHull(hull, x, y))) return room.key
  const [gx, gy] = unproject(x, y)
  for (const room of [...rooms, plan.plaza]) {
    const [rx, ry, rw, rh] = room.rect
    if (gx >= rx && gx <= rx + rw && gy >= ry && gy <= ry + rh) return room.key
  }
  return null
}

function plotOf(key) {
  return key === 'plaza' ? plan.plaza : plan.rooms[key]
}

function drawTip(key) {
  const room = plotOf(key)
  if (!room || !pointer) return
  const count = key === 'plaza' ? null : [...sprites.values()].filter(sprite => sprite.data && !sprite.gone && sprite.room === key && sprite.slot >= 0).length
  const rows = [[`700 12px ${FONT}`, '#2b2f38', `${room.icon} ${room.label}`], [`500 11px ${FONT}`, '#5b6270', room.note]]
  if (count !== null) rows.push([`600 11px ${FONT}`, count ? '#b8642f' : '#8a8f9a', count ? `${count}명 활동 중` : '비어 있음'])
  let w = 0
  for (const [font, , text] of rows) {
    ctx.font = font
    w = Math.max(w, ctx.measureText(text).width)
  }
  w = Math.ceil(w + 18)
  const h = rows.length * 16 + 10
  const x = Math.max(4, Math.min(view.width - w - 4, pointer.x + 14))
  const y = Math.max(4, Math.min(view.height - h - 4, pointer.y - h - 10))
  box(x, y, w, h, 'rgba(255, 252, 244, 0.97)', '#c9a66b', 8)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  rows.forEach(([font, color, text], i) => {
    ctx.font = font
    ctx.fillStyle = color
    ctx.fillText(text, x + 9, y + 13 + i * 16)
  })
  ctx.textBaseline = 'alphabetic'
}

function draw(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  if (!ground || ground.key !== groundKey()) ground = buildGround()
  ctx.drawImage(ground.canvas, 0, 0)
  const s = view.dpr * view.scale
  ctx.setTransform(s, 0, 0, s, view.dpr * view.ox, view.dpr * view.oy)
  const lit = hover ? plotOf(hover) : null
  if (lit) {
    ctx.save()
    ctx.translate(...project(...lit.origin))
    poly([P(0, 0), P(CELL, 0), P(CELL, CELL), P(0, CELL)], 'rgba(255, 244, 190, 0.28)', 'rgba(255, 214, 90, 0.95)', 3)
    ctx.restore()
  }
  const steps = sceneSteps()
  const ghosts = ghostsOf(steps)
  lastOrder = steps.map(step => step.id)
  lastGhosts = ghosts.map(sprite => sprite.id)
  for (const step of steps) {
    if (step.sprite) {
      drawPerson(step.sprite, t)
      continue
    }
    ctx.save()
    ctx.translate(...project(...step.origin))
    step.paint(t)
    ctx.restore()
  }
  for (const sprite of ghosts) drawPerson(sprite, t, true)
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0)
  ctx.globalAlpha = 1
  const now = serverNow()
  for (const plate of plateLayout(view)) drawPlate(plate)
  const cards = cardLayout(view, now, t)
  for (let i = cards.length - 1; i >= 0; i--) drawCard(cards[i], t)
  if (hover) drawTip(hover)
}

function frame(nowMs) {
  const dt = Math.min(0.1, (nowMs - lastFrame) / 1000)
  lastFrame = nowMs
  try {
    if ((window.devicePixelRatio || 1) !== view.dpr) layout()
    step(dt)
    draw(nowMs / 1000)
  } finally {
    requestAnimationFrame(frame)
  }
}

function layout() {
  const next = getComputedStyle(ui.wrap).getPropertyValue('--plan').trim() === 'tall' ? TALL : WIDE
  if (next !== plan) replan(next)
  const rect = ui.canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  ui.canvas.width = Math.max(1, Math.round(rect.width * dpr))
  ui.canvas.height = Math.max(1, Math.round(rect.height * dpr))
  view = camera(plan, rect.width, rect.height, dpr)
}

function hoverAt(event) {
  const rect = ui.canvas.getBoundingClientRect()
  pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  hover = pickPlot(pointer.x, pointer.y)
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
    case 'leaving': return '🌀 귀환합니다!'
    case 'resting': return '💤 30분 넘게 조용함'
    default: return actor.main ? '⌨️ 입력 기다리는 중' : '📝 보고 정리 중'
  }
}

function renderPeople(office, now) {
  const actors = office ? office.actors : []
  ui.headcount.textContent = `${actors.length}명 활동 중`
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

ui.canvas.addEventListener('pointermove', hoverAt)
ui.canvas.addEventListener('pointerdown', hoverAt)
ui.canvas.addEventListener('pointerleave', event => {
  if (event.pointerType === 'touch') return
  hover = null
  pointer = null
})

new ResizeObserver(layout).observe(ui.wrap)
layout()
renderLegend()
requestAnimationFrame(frame)
poll()
