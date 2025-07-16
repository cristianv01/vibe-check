import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock button component for testing
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  ...props 
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium'
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

describe('Button Component', () => {
  test('renders button with children', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('does not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  test('applies correct classes for primary variant', () => {
    render(<Button variant="primary">Primary Button</Button>)
    
    const button = screen.getByRole('button', { name: /primary button/i })
    expect(button).toHaveClass('bg-blue-500', 'text-white')
  })

  test('applies correct classes for secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button', { name: /secondary button/i })
    expect(button).toHaveClass('bg-gray-200', 'text-gray-800')
  })

  test('applies disabled styling when disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
    expect(button).toBeDisabled()
  })

  test('accepts custom props', () => {
    render(<Button data-testid="custom-button">Custom Props</Button>)
    
    const button = screen.getByTestId('custom-button')
    expect(button).toBeInTheDocument()
  })
}) 