import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isSuperAdmin,
  type Permissions,
} from '../permissions'

describe('permissions', () => {
  describe('hasPermission', () => {
    it('returns false when permissions is null', () => {
      expect(hasPermission(null, 'projects:read')).toBe(false)
    })
    it('returns false when permissions is undefined', () => {
      expect(hasPermission(undefined, 'projects:read')).toBe(false)
    })
    it('returns true when all includes wildcard', () => {
      expect(hasPermission({ instance: [], organisation: [], project: [], all: ['*'] }, 'projects:read')).toBe(true)
    })
    it('returns true when all includes specific permission', () => {
      expect(hasPermission({ instance: [], organisation: [], project: [], all: ['projects:read'] }, 'projects:read')).toBe(true)
    })
    it('returns false when permission not in all', () => {
      expect(hasPermission({ instance: [], organisation: [], project: [], all: ['projects:read'] }, 'projects:delete')).toBe(false)
    })
  })

  describe('hasAnyPermission', () => {
    it('returns false when permissions is null', () => {
      expect(hasAnyPermission(null, ['projects:read'])).toBe(false)
    })
    it('returns true when all includes wildcard', () => {
      expect(hasAnyPermission({ instance: [], organisation: [], project: [], all: ['*'] }, ['projects:read'])).toBe(true)
    })
    it('returns true when user has at least one permission', () => {
      expect(hasAnyPermission(
        { instance: [], organisation: [], project: [], all: ['projects:read'] },
        ['projects:read', 'projects:delete']
      )).toBe(true)
    })
    it('returns false when user has none of the permissions', () => {
      expect(hasAnyPermission(
        { instance: [], organisation: [], project: [], all: ['projects:read'] },
        ['projects:delete', 'projects:update']
      )).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('returns false when permissions is null', () => {
      expect(hasAllPermissions(null, ['projects:read'])).toBe(false)
    })
    it('returns true when all includes wildcard', () => {
      expect(hasAllPermissions({ instance: [], organisation: [], project: [], all: ['*'] }, ['projects:read', 'projects:delete'])).toBe(true)
    })
    it('returns true when user has all permissions', () => {
      expect(hasAllPermissions(
        { instance: [], organisation: [], project: [], all: ['projects:read', 'projects:delete'] },
        ['projects:read', 'projects:delete']
      )).toBe(true)
    })
    it('returns false when user missing one permission', () => {
      expect(hasAllPermissions(
        { instance: [], organisation: [], project: [], all: ['projects:read'] },
        ['projects:read', 'projects:delete']
      )).toBe(false)
    })
  })

  describe('isSuperAdmin', () => {
    it('returns false when permissions is null', () => {
      expect(isSuperAdmin(null)).toBe(false)
    })
    it('returns true when instance includes wildcard', () => {
      expect(isSuperAdmin({ instance: ['*'], organisation: [], project: [], all: [] })).toBe(true)
    })
    it('returns false when instance does not include wildcard', () => {
      expect(isSuperAdmin({ instance: [], organisation: [], project: [], all: ['*'] })).toBe(false)
    })
  })
})
