import { render, screen } from '@testing-library/react'
import { SetupFeatureImage } from '../setup-feature-image'

jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

describe('SetupFeatureImage', () => {
  it('renders image when theme is resolved', async () => {
    render(<SetupFeatureImage />)
    const img = await screen.findByRole('img', { name: 'Data Analytics Dashboard' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/images/arcane_light.png')
  })
})
