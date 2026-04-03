import React from 'react'
import { render, screen } from '@testing-library/react'
import { Navbar } from '../navbar'

const mockOrganisations = [
  { id: 'org-1', name: 'Org One' },
  { id: 'org-2', name: 'Org Two' },
]

const mockSetCurrentOrganisation = jest.fn()
const mockSetOrganisations = jest.fn()

const mockUseCurrentOrganisation = jest.fn()
const mockUseOrganisations = jest.fn()

jest.mock('@/store/organisationStore', () => ({
  useCurrentOrganisation: () => mockUseCurrentOrganisation(),
  useOrganisations: () => mockUseOrganisations(),
  useSetCurrentOrganisation: () => mockSetCurrentOrganisation,
  useSetOrganisations: () => mockSetOrganisations,
}))

jest.mock('@/api/organisations', () => ({
  organisationsApi: {
    getAll: jest.fn().mockResolvedValue([
      { id: 'org-1', name: 'Org One' },
      { id: 'org-2', name: 'Org Two' },
    ]),
  },
}))

const mockUseIsSuperAdmin = jest.fn(() => false)
jest.mock('@/hooks/usePermissions', () => ({
  ...jest.requireActual('@/hooks/usePermissions'),
  useIsSuperAdmin: () => mockUseIsSuperAdmin(),
}))

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mockUseOrganisations.mockReturnValue(mockOrganisations)
    mockUseCurrentOrganisation.mockReturnValue(mockOrganisations[0])
  })

  it('renders organisation selector with Building2 icon', () => {
    render(<Navbar />)
    expect(screen.getByTestId('icon-building2')).toBeInTheDocument()
  })

  it('shows current organisation name when organisations are loaded', () => {
    render(<Navbar />)
    expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'org-1')
  })

  it('shows "No organisations..." when list is empty', () => {
    mockUseOrganisations.mockReturnValue([])
    mockUseCurrentOrganisation.mockReturnValue(null)
    localStorage.setItem(
      'organisation-storage',
      JSON.stringify({ state: { organisations: [] } })
    )

    render(<Navbar />)
    expect(screen.getByText('No organisations...')).toBeInTheDocument()
  })

  it('shows super admin button when user is super admin', () => {
    mockUseIsSuperAdmin.mockReturnValue(true)

    render(<Navbar />)
    expect(screen.getByTitle('Instance Administration')).toBeInTheDocument()
  })
})
