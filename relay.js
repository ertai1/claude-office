'use strict'

;(() => {
  const STORE_KEY = 'claude-office-relay'
  const BRANCH = 'state'
  const FILE = 'office.json'
  const AAD = new TextEncoder().encode('claude-office/v1')
  const INTERVAL_MS = 5000
  const RETRY_MS = 15000
  const SETUP_WAIT_MS = 60000
  const LIMIT_WAIT_S = 60
  const STALE_S = 300
  const MIN_ITER = 100000
  const MAX_ITER = 5000000
  const REPO_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9._-]{1,100}$/

  const metaValue = name => (document.querySelector(`meta[name="${name}"]`)?.content ?? '').trim()
  const api = (metaValue('office-api') || 'https://api.github.com').replace(/\/+$/, '')
  const defaultRepo = metaValue('office-repo')

  const dom = {
    setup: document.getElementById('setup'),
    form: document.getElementById('setupForm'),
    repo: document.getElementById('setupRepo'),
    token: document.getElementById('setupToken'),
    pass: document.getElementById('setupPass'),
    remember: document.getElementById('setupRemember'),
    message: document.getElementById('setupError'),
    forget: document.getElementById('setupForget'),
    close: document.getElementById('setupClose'),
    open: document.getElementById('relayButton'),
    status: document.getElementById('relayStatus'),
  }

  let settings = load()
  let cache = blank()

  function blank() {
    return { etag: '', snap: null, keyId: '', key: null }
  }

  function valid(value) {
    return Boolean(value && typeof value === 'object' && REPO_PATTERN.test(value.repo ?? '')
      && typeof value.token === 'string' && value.token.trim() && typeof value.pass === 'string' && value.pass.trim())
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      const value = raw ? JSON.parse(raw) : null
      return valid(value) ? value : null
    } catch {
      return null
    }
  }

  function save(value) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(value))
    } catch {
      return false
    }
    return true
  }

  function erase() {
    try {
      localStorage.removeItem(STORE_KEY)
    } catch {
      return false
    }
    return true
  }

  function fail(message, retryMs = RETRY_MS) {
    const error = new Error(message)
    error.userMessage = message
    error.retryMs = retryMs
    return error
  }

  function moved() {
    return fail('연결 설정이 바뀌어 다시 읽는 중입니다', 0)
  }

  function openSetup(message = '') {
    if (dom.setup.hidden) {
      dom.repo.value = settings?.repo ?? (dom.repo.value || defaultRepo)
      dom.token.value = settings?.token ?? ''
      dom.pass.value = settings?.pass ?? ''
    }
    dom.message.textContent = message
    dom.close.hidden = !settings
    dom.setup.hidden = false
  }

  function closeSetup() {
    dom.setup.hidden = true
    dom.message.textContent = ''
  }

  function unb64(text) {
    if (typeof text !== 'string') throw new TypeError('not base64')
    return Uint8Array.from(atob(text), ch => ch.charCodeAt(0))
  }

  function clock(t) {
    const d = new Date(t * 1000)
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':')
  }

  function ask(mine, message) {
    if (settings === mine) openSetup(message)
  }

  async function messageOf(response) {
    try {
      const body = await response.json()
      return typeof body?.message === 'string' ? body.message : ''
    } catch {
      return ''
    }
  }

  async function download(mine, store) {
    const headers = {
      Authorization: `Bearer ${mine.token.trim()}`,
      Accept: 'application/vnd.github.raw+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (store.etag && store.snap) headers['If-None-Match'] = store.etag
    let response
    try {
      response = await fetch(`${api}/repos/${mine.repo}/contents/${FILE}?ref=${BRANCH}`, {
        headers, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
      })
    } catch (error) {
      throw fail(`GitHub에 연결할 수 없습니다 (${error.message}) · 다시 시도 중`)
    }
    if (response.status === 304 && store.snap) return null
    if (response.status === 401) {
      ask(mine, 'GitHub가 토큰을 거부했습니다. 토큰을 다시 넣어 주세요')
      throw fail('GitHub가 토큰을 거부했습니다', SETUP_WAIT_MS)
    }
    if (response.status === 403 || response.status === 429) {
      const retry = Number(response.headers.get('Retry-After'))
      const reset = Number(response.headers.get('X-RateLimit-Reset'))
      if (retry > 0) throw fail(`GitHub 요청 한도에 걸렸습니다 · ${Math.ceil(retry)}초 뒤 다시 시도`, retry * 1000)
      if (response.headers.get('X-RateLimit-Remaining') === '0' && reset > 0) {
        const wait = Math.max(5, reset - Date.now() / 1000)
        throw fail(`GitHub 요청 한도에 걸렸습니다 · ${Math.ceil(wait)}초 뒤 다시 시도`, wait * 1000)
      }
      if (response.status === 429 || /rate limit/i.test(await messageOf(response))) {
        throw fail(`GitHub 요청 한도에 걸렸습니다 · ${LIMIT_WAIT_S}초 뒤 다시 시도`, LIMIT_WAIT_S * 1000)
      }
      ask(mine, '이 토큰으로는 저장소를 읽을 수 없습니다. 토큰 권한을 확인해 주세요')
      throw fail('토큰 권한이 부족합니다', SETUP_WAIT_MS)
    }
    if (response.status === 404) {
      throw fail('저장소나 상태 파일을 찾을 수 없습니다 · 저장소 이름, 토큰 권한, PC 업로더 실행을 확인하세요')
    }
    if (!response.ok) throw fail(`GitHub 응답 오류 HTTP ${response.status} · 다시 시도 중`)
    return { text: await response.text(), etag: response.headers.get('ETag') ?? '' }
  }

  async function keyFor(salt, iterations, mine, store) {
    const id = JSON.stringify([salt, iterations, mine.pass])
    if (store.keyId === id) return store.key
    const secret = new TextEncoder().encode(mine.pass.trim().normalize('NFC'))
    const base = await crypto.subtle.importKey('raw', secret, 'PBKDF2', false, ['deriveKey'])
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: unb64(salt), iterations },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
    store.key = key
    store.keyId = id
    return key
  }

  async function unseal(text, mine, store) {
    let envelope
    try {
      envelope = JSON.parse(text)
    } catch {
      throw fail('상태 파일 형식이 올바르지 않습니다')
    }
    if (!envelope || envelope.v !== 1 || envelope.alg !== 'A256GCM' || envelope.kdf !== 'PBKDF2-SHA256' || envelope.zip !== 'gzip') {
      throw fail('이 뷰어가 모르는 상태 파일 형식입니다 · 페이지를 새로 고쳐 주세요', SETUP_WAIT_MS)
    }
    const iterations = envelope.iter
    if (!Number.isInteger(iterations) || iterations < MIN_ITER || iterations > MAX_ITER) {
      throw fail('상태 파일의 암호 설정이 올바르지 않습니다', SETUP_WAIT_MS)
    }
    let iv
    let data
    try {
      iv = unb64(envelope.iv)
      data = unb64(envelope.data)
      unb64(envelope.salt)
    } catch {
      throw fail('상태 파일 형식이 올바르지 않습니다')
    }
    if (!globalThis.crypto?.subtle) throw fail('이 주소에서는 브라우저 암호 기능을 쓸 수 없습니다 (https 필요)', SETUP_WAIT_MS)
    if (typeof DecompressionStream !== 'function') throw fail('이 브라우저는 압축 해제를 지원하지 않습니다 · 최신 브라우저로 열어 주세요', SETUP_WAIT_MS)
    const key = await keyFor(envelope.salt, iterations, mine, store)
    let plain
    try {
      plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: AAD }, key, data)
    } catch {
      ask(mine, '암호가 맞지 않습니다. PC의 passphrase.txt에 적힌 암호를 넣어 주세요')
      throw fail('암호가 맞지 않습니다', SETUP_WAIT_MS)
    }
    const json = await new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))).text()
    const snap = JSON.parse(json)
    if (!snap || snap.v !== 1 || !Array.isArray(snap.floors) || !Array.isArray(snap.offices) || typeof snap.now !== 'number') {
      throw fail('이 뷰어가 모르는 상태 형식입니다 · 페이지를 새로 고쳐 주세요', SETUP_WAIT_MS)
    }
    return snap
  }

  function ageOf(snap) {
    return Date.now() / 1000 - snap.now
  }

  function showStatus(snap) {
    const age = ageOf(snap)
    const stale = age > STALE_S
    dom.status.textContent = stale
      ? `⚠ PC가 ${Math.floor(age / 60)}분째 새 상태를 올리지 않았습니다 · 업로더가 꺼졌거나 PC가 잠들었을 수 있습니다`
      : `PC 상태 ${clock(snap.now)} 기준 · 5초마다 확인 · 도구 이름과 상태만 받습니다`
    dom.status.classList.toggle('stale', stale)
  }

  function quiet(floors) {
    return floors.map(floor => ({
      ...floor, active: false, sessions: floor.sessions.map(session => ({ ...session, active: false })),
    }))
  }

  function compose(snap, session) {
    const stale = ageOf(snap) > STALE_S
    const offices = new Map(snap.offices.map(office => [office.sessionId, office]))
    const wanted = session ?? snap.followed
    const found = offices.get(wanted) ?? null
    const office = found && stale ? { ...found, live: false } : found
    const notice = session && !office ? '이 세션은 PC가 휴대폰으로 보낸 최근 세션에 들지 않았습니다 · 자동으로 따라가기를 켜면 최근 세션으로 돌아갑니다' : ''
    return { now: Date.now() / 1000, follow: false, office, floors: stale ? quiet(snap.floors) : snap.floors, notice }
  }

  function empty() {
    return { now: Date.now() / 1000, follow: false, office: null, floors: [], notice: '' }
  }

  window.officeSource = {
    interval: INTERVAL_MS,
    retry: RETRY_MS,
    async state(session) {
      const mine = settings
      const store = cache
      if (!mine) {
        if (dom.setup.hidden) openSetup()
        throw Object.assign(fail('연결 설정이 필요합니다', SETUP_WAIT_MS), { view: empty() })
      }
      try {
        const got = await download(mine, store)
        if (got) {
          store.snap = await unseal(got.text, mine, store)
          store.etag = got.etag
        }
      } catch (error) {
        if (settings !== mine) throw moved()
        if (store.snap) {
          showStatus(store.snap)
          error.view = compose(store.snap, session)
        }
        throw error
      }
      if (settings !== mine) throw moved()
      showStatus(store.snap)
      return compose(store.snap, session)
    },
  }

  dom.form.addEventListener('submit', event => {
    event.preventDefault()
    const value = { repo: dom.repo.value.trim(), token: dom.token.value.trim(), pass: dom.pass.value }
    if (!REPO_PATTERN.test(value.repo)) {
      dom.message.textContent = '저장소는 owner/name 형식으로 넣어 주세요'
      return
    }
    if (!value.token || !value.pass.trim()) {
      dom.message.textContent = '토큰과 암호를 모두 넣어 주세요'
      return
    }
    settings = value
    cache = blank()
    if (dom.remember.checked) {
      if (!save(value)) dom.message.textContent = '이 브라우저에는 저장할 수 없어 이번 방문에만 씁니다'
    } else {
      erase()
    }
    closeSetup()
    window.officeRefresh?.()
  })

  dom.forget.addEventListener('click', () => {
    erase()
    settings = null
    cache = blank()
    dom.token.value = ''
    dom.pass.value = ''
    dom.close.hidden = true
    dom.status.textContent = ''
    dom.message.textContent = '이 기기에 저장된 토큰과 암호를 지웠습니다'
    window.officeRefresh?.()
  })

  dom.close.addEventListener('click', closeSetup)
  dom.open.addEventListener('click', () => openSetup())
})()
