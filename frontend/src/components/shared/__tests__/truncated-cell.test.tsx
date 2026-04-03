import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TruncatedCell } from '../truncated-cell'

describe('TruncatedCell', () => {
  it('renders full value when shorter than maxLength', () => {
    render(<TruncatedCell value="short" maxLength={50} />)
    expect(screen.getByText('short')).toBeInTheDocument()
  })

  it('truncates value when longer than maxLength', () => {
    const longValue = 'a'.repeat(60)
    render(<TruncatedCell value={longValue} maxLength={50} />)
    const truncated = longValue.substring(0, 50) + '...'
    expect(screen.getByText(truncated)).toBeInTheDocument()
  })

  it('copies full value to clipboard when copy clicked', async () => {
    const user = userEvent.setup()
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })
    render(<TruncatedCell value="copy-me" />)
    const copyBtn = screen.getByTitle('Copy to clipboard')
    await user.click(copyBtn)
    expect(writeText).toHaveBeenCalledWith('copy-me')
  })
})
