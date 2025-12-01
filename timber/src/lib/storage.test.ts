import { describe, it, expect, beforeEach } from 'vitest'
import {
  encodeShareData,
  decodeShareData,
  createTimberShareUrl,
  createSheetShareUrl,
  getShareDataFromUrl,
  type ShareableTimberData,
  type ShareableSheetData,
} from './storage'

describe('URL Share Functions', () => {
  beforeEach(() => {
    // Reset window.location for each test
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
        pathname: '/',
        hash: '',
      },
      writable: true,
    })
  })

  describe('encodeShareData / decodeShareData', () => {
    it('encodes and decodes timber data correctly', () => {
      const data: ShareableTimberData = {
        t: 'linear',
        n: 'Test Project',
        ti: [{ length: 2400, price: 19.2 }],
        c: [{ length: 600, quantity: 4 }],
        o: [{ length: 1200, quantity: 1 }],
        k: 3,
        m: 'cost',
        u: 'mm',
      }

      const encoded = encodeShareData(data)
      expect(encoded).toBeTruthy()
      expect(encoded).not.toContain('+')
      expect(encoded).not.toContain('/')
      expect(encoded).not.toContain('=')

      const decoded = decodeShareData(encoded)
      expect(decoded).toEqual(data)
    })

    it('encodes and decodes sheet data correctly', () => {
      const data: ShareableSheetData = {
        t: 'sheet',
        n: 'Sheet Project',
        s: [{ width: 2440, height: 1220, price: 45.0 }],
        p: [{ width: 600, height: 400, quantity: 4, canRotate: true }],
        o: [{ width: 1000, height: 500, quantity: 2 }],
        k: 3,
        m: 'waste',
        u: 'in',
        g: true,
      }

      const encoded = encodeShareData(data)
      const decoded = decodeShareData(encoded)
      expect(decoded).toEqual(data)
    })

    it('handles empty arrays', () => {
      const data: ShareableTimberData = {
        t: 'linear',
        n: 'Empty Project',
        ti: [],
        c: [],
        o: [],
        k: 0,
        m: 'cost',
        u: 'mm',
      }

      const encoded = encodeShareData(data)
      const decoded = decodeShareData(encoded)
      expect(decoded).toEqual(data)
    })

    it('handles special characters in project name', () => {
      const data: ShareableTimberData = {
        t: 'linear',
        n: 'Test & Project <with> "special" chars!',
        ti: [{ length: 1000, price: 10 }],
        c: [{ length: 500, quantity: 1 }],
        o: [],
        k: 3,
        m: 'cost',
        u: 'mm',
      }

      const encoded = encodeShareData(data)
      const decoded = decodeShareData(encoded)
      expect(decoded).toEqual(data)
    })

    it('handles unicode characters', () => {
      const data: ShareableTimberData = {
        t: 'linear',
        n: 'Проект 木材切割',
        ti: [{ length: 1000, price: 10 }],
        c: [],
        o: [],
        k: 3,
        m: 'cost',
        u: 'mm',
      }

      const encoded = encodeShareData(data)
      const decoded = decodeShareData(encoded)
      expect(decoded).toEqual(data)
    })

    it('returns null for invalid encoded data', () => {
      expect(decodeShareData('invalid!')).toBeNull()
      expect(decodeShareData('')).toBeNull()
      expect(decodeShareData('notbase64@#$')).toBeNull()
    })

    it('returns null for valid base64 but invalid JSON', () => {
      const invalidJson = btoa('not json').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      expect(decodeShareData(invalidJson)).toBeNull()
    })
  })

  describe('createTimberShareUrl', () => {
    it('creates valid share URL', () => {
      const url = createTimberShareUrl(
        'My Project',
        [{ length: 2400, price: 19.2 }],
        [{ length: 600, quantity: 4 }],
        [],
        3,
        'cost',
        'mm'
      )

      expect(url).toContain('http://localhost:3000/')
      expect(url).toContain('#/linear?share=')
      
      // Extract and decode the share data
      const match = url.match(/share=([^&]+)/)
      expect(match).toBeTruthy()
      const decoded = decodeShareData(match![1])
      expect(decoded).toMatchObject({
        t: 'linear',
        n: 'My Project',
        k: 3,
        m: 'cost',
        u: 'mm',
      })
    })

    it('uses default name when empty', () => {
      const url = createTimberShareUrl(
        '',
        [{ length: 2400, price: 19.2 }],
        [{ length: 600, quantity: 4 }],
        [],
        3,
        'cost',
        'mm'
      )

      const match = url.match(/share=([^&]+)/)
      const decoded = decodeShareData(match![1])
      expect(decoded?.n).toBe('Shared Project')
    })
  })

  describe('createSheetShareUrl', () => {
    it('creates valid share URL with grain option', () => {
      const url = createSheetShareUrl(
        'Sheet Project',
        [{ width: 2440, height: 1220, price: 45 }],
        [{ width: 600, height: 400, quantity: 2, canRotate: true }],
        [],
        3,
        'waste',
        'in',
        true
      )

      expect(url).toContain('#/sheet?share=')
      
      const match = url.match(/share=([^&]+)/)
      const decoded = decodeShareData(match![1]) as ShareableSheetData
      expect(decoded.t).toBe('sheet')
      expect(decoded.g).toBe(true)
      expect(decoded.u).toBe('in')
    })
  })

  describe('getShareDataFromUrl', () => {
    it('returns null when no share param', () => {
      window.location.hash = '#/linear'
      expect(getShareDataFromUrl()).toBeNull()
    })

    it('returns null for empty hash', () => {
      window.location.hash = ''
      expect(getShareDataFromUrl()).toBeNull()
    })

    it('extracts and decodes share data from URL', () => {
      const data: ShareableTimberData = {
        t: 'linear',
        n: 'URL Test',
        ti: [{ length: 1000, price: 5 }],
        c: [{ length: 500, quantity: 2 }],
        o: [],
        k: 3,
        m: 'cost',
        u: 'mm',
      }
      const encoded = encodeShareData(data)
      window.location.hash = `#/linear?share=${encoded}`

      const result = getShareDataFromUrl()
      expect(result).toEqual(data)
    })

    it('handles share param with other params', () => {
      const data: ShareableSheetData = {
        t: 'sheet',
        n: 'Multi Param Test',
        s: [],
        p: [],
        o: [],
        k: 3,
        m: 'cost',
        u: 'mm',
      }
      const encoded = encodeShareData(data)
      window.location.hash = `#/sheet?foo=bar&share=${encoded}&baz=qux`

      const result = getShareDataFromUrl()
      expect(result).toEqual(data)
    })

    it('returns null for invalid share data in URL', () => {
      window.location.hash = '#/linear?share=invaliddata!!!'
      expect(getShareDataFromUrl()).toBeNull()
    })
  })

  describe('round-trip encoding', () => {
    it('preserves all timber data through URL creation and extraction', () => {
      const timbers = [
        { length: 1200, price: 9.4 },
        { length: 2400, price: 19.2 },
        { length: 3600, price: 28.7 },
      ]
      const cuts = [
        { length: 600, quantity: 4 },
        { length: 800, quantity: 2 },
      ]
      const owned = [{ length: 1500, quantity: 1 }]

      const url = createTimberShareUrl('Full Test', timbers, cuts, owned, 3.2, 'waste', 'in')
      
      // Simulate navigating to the URL
      const match = url.match(/share=([^&]+)/)
      window.location.hash = `#/linear?share=${match![1]}`

      const result = getShareDataFromUrl() as ShareableTimberData
      expect(result.t).toBe('linear')
      expect(result.n).toBe('Full Test')
      expect(result.ti).toEqual(timbers)
      expect(result.c).toEqual(cuts)
      expect(result.o).toEqual(owned)
      expect(result.k).toBe(3.2)
      expect(result.m).toBe('waste')
      expect(result.u).toBe('in')
    })

    it('preserves all sheet data through URL creation and extraction', () => {
      const sheets = [{ width: 2440, height: 1220, price: 45 }]
      const panels = [
        { width: 600, height: 400, quantity: 4, canRotate: true },
        { width: 300, height: 200, quantity: 8, canRotate: false },
      ]
      const owned = [{ width: 1000, height: 800, quantity: 2 }]

      const url = createSheetShareUrl('Sheet Full Test', sheets, panels, owned, 4, 'cost', 'mm', true)
      
      const match = url.match(/share=([^&]+)/)
      window.location.hash = `#/sheet?share=${match![1]}`

      const result = getShareDataFromUrl() as ShareableSheetData
      expect(result.t).toBe('sheet')
      expect(result.n).toBe('Sheet Full Test')
      expect(result.s).toEqual(sheets)
      expect(result.p).toEqual(panels)
      expect(result.o).toEqual(owned)
      expect(result.k).toBe(4)
      expect(result.m).toBe('cost')
      expect(result.u).toBe('mm')
      expect(result.g).toBe(true)
    })
  })
})
