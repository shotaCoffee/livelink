import { render } from '@solidjs/testing-library'
import { describe, it, expect } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders with default props', () => {
    const { container } = render(() => <Button>Click me</Button>)
    const button = container.querySelector('button')

    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
    expect(button).toHaveClass('btn-base', 'btn-primary')
  })

  it('renders with different variants', () => {
    const { container } = render(() => (
      <Button variant="secondary">Secondary</Button>
    ))
    const button = container.querySelector('button')

    expect(button).toHaveClass('btn-secondary')
  })

  it('shows loading state', () => {
    const { container } = render(() => <Button loading>Loading</Button>)
    const button = container.querySelector('button')
    const spinner = container.querySelector('svg')

    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-75')
    expect(spinner).toBeInTheDocument()
  })

  it('handles click events', () => {
    let clicked = false
    const handleClick = () => {
      clicked = true
    }

    const { container } = render(() => (
      <Button onClick={handleClick}>Click</Button>
    ))
    const button = container.querySelector('button')

    button?.click()
    expect(clicked).toBe(true)
  })
})
