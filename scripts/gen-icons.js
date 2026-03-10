const zlib = require('zlib')
const fs = require('fs')

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    table[i] = c >>> 0
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = (table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBytes = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeBytes, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, typeBytes, data, crc])
}

function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8   // bit depth
  ihdrData[9] = 2   // color type: RGB
  ihdrData[10] = 0  // compression
  ihdrData[11] = 0  // filter
  ihdrData[12] = 0  // interlace

  const rowSize = 1 + size * 3  // filter byte + RGB per pixel
  const rawData = Buffer.alloc(rowSize * size)
  for (let y = 0; y < size; y++) {
    const offset = y * rowSize
    rawData[offset] = 0  // filter type: None
    for (let x = 0; x < size; x++) {
      rawData[offset + 1 + x * 3] = r
      rawData[offset + 2 + x * 3] = g
      rawData[offset + 3 + x * 3] = b
    }
  }

  const compressed = zlib.deflateSync(rawData)

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

// Blue #1d4ed8 = rgb(29, 78, 216)
const R = 29, G = 78, B = 216

fs.mkdirSync('public/icons', { recursive: true })
fs.writeFileSync('public/icons/icon-192x192.png', createPNG(192, R, G, B))
fs.writeFileSync('public/icons/icon-512x512.png', createPNG(512, R, G, B))
fs.writeFileSync('public/icons/icon-512x512-maskable.png', createPNG(512, R, G, B))
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, R, G, B))

console.log('PWA placeholder icons created.')
