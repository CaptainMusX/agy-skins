import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createMediaServer, createSigner, safeChild } from '../sidecars/wallpaper_engine/media_server.mjs'

test('createSigner verifies valid HMAC tokens and rejects tampered ones', () => {
  const signer = createSigner(Buffer.from('0123456789abcdef0123456789abcdef'))
  const token = signer.signPath('C:\\Wallpapers\\scene.mp4')
  assert.equal(signer.verifyPath(token), 'C:\\Wallpapers\\scene.mp4')
  assert.equal(signer.verifyPath(token.slice(0, -2) + 'xx'), null)
  assert.equal(signer.verifyPath('bad'), null)
})

test('safeChild blocks directory traversal and drive escapes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'agy-safe-'))
  try {
    writeFileSync(join(dir, 'project.json'), '{}')
    const ok = safeChild(dir, 'project.json')
    assert.equal(ok.ok, true)
    const bad = safeChild(dir, '../secret.txt')
    assert.equal(bad.ok, false)
    assert.equal(bad.status, 403)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('createMediaServer enforces HMAC tokens, serves HTTP 206 ranges, WebWallGL, and Studio API auth', async () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'agy-ms-'))
  const mediaFile = join(dataDir, 'sample.mp4')
  writeFileSync(mediaFile, Buffer.from('0123456789ABCDEF'))

  const server = createMediaServer({
    secret: Buffer.from('fedcba9876543210fedcba9876543210'),
    dataDir,
    studioHtmlProvider: tok => `<html>${tok}</html>`,
    studioApiHandlers: {
      'ping': async body => ({ ok: true, echo: body?.msg || 'pong' })
    },
    onRuntimeEvent: async ev => ({ ok: true, seen: ev?.type })
  })

  try {
    await server.start(0)
    assert.match(server.origin, /^http:\/\/127\.0\.0\.1:\d+$/)

    // Signed media file 206 Range streaming
    const signedUrl = server.fileUrl(mediaFile)
    const rangeRes = await fetch(signedUrl, { headers: { Range: 'bytes=4-9' } })
    assert.equal(rangeRes.status, 206)
    assert.equal(await rangeRes.text(), '456789')

    // Invalid token refused
    const badUrl = `${server.origin}/api/agy-skins/media/file/invalid.token`
    const badRes = await fetch(badUrl)
    assert.equal(badRes.status, 403)

    // WebWallGL live endpoint served locally
    const glRes = await fetch(`${server.origin}/api/agy-skins/scene/live/index.html`)
    assert.equal(glRes.status, 200)
    assert.match(await glRes.text(), /renderer\.js/)

    // Studio HTML & API token enforcement
    const stUrl = server.studioUrl()
    const stRes = await fetch(stUrl)
    assert.equal(stRes.status, 200)

    const unauthApi = await fetch(`${server.origin}/studio-api/ping`, { method: 'POST', body: '{}' })
    assert.ok([401, 403].includes(unauthApi.status))

    const studioToken = stUrl.split('/studio/')[1].split('/')[0]
    const authApi = await fetch(`${server.origin}/studio-api/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-agy-studio-token': studioToken },
      body: JSON.stringify({ msg: 'hello' })
    })
    assert.equal(authApi.status, 200)
    assert.deepEqual(await authApi.json(), { ok: true, echo: 'hello' })
  } finally {
    await server.close()
    rmSync(dataDir, { recursive: true, force: true })
  }
})
