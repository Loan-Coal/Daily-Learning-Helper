import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TagBadge from '../components/TagBadge';

// Utility wrapper for components that need React Router
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('TagBadge Component', () => {
  it('renders tag text correctly', () => {
    render(<TagBadge tag="computer science" />, { wrapper: TestWrapper });
    
    expect(screen.getByText('computer science')).toBeInTheDocument();
  });

  it('renders remove button when onRemove is provided', () => {
    const mockRemove = jest.fn();
    render(<TagBadge tag="test tag" onRemove={mockRemove} />, { wrapper: TestWrapper });
    
    const removeButton = screen.getByRole('button');
    expect(removeButton).toBeInTheDocument();
  });

  it('does not render remove button when onRemove is not provided', () => {
    render(<TagBadge tag="test tag" />, { wrapper: TestWrapper });
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});