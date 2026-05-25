import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

describe('App', () => {
  it('renders navigation and brand text', () => {
    render(<App />);

    expect(screen.getByText(/Pandea/i)).toBeInTheDocument();
    expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
  });
});
