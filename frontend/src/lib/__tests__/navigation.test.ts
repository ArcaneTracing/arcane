import { createNavigationPath, createNavigationOptions } from '../navigation'

describe('navigation', () => {
  describe('createNavigationPath', () => {
    it('returns path as ToOptions', () => {
      const path = createNavigationPath('/organisations/org1/projects')
      expect(path).toBe('/organisations/org1/projects')
    })
  })

  describe('createNavigationOptions', () => {
    it('returns options with path', () => {
      const opts = createNavigationOptions('/test')
      expect(opts.to).toBe('/test')
    })
    it('merges additional options', () => {
      const opts = createNavigationOptions('/test', { replace: true })
      expect(opts.to).toBe('/test')
      expect((opts as any).replace).toBe(true)
    })
  })
})
