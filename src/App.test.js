import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Gitpoints heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Gitpoints/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders username input', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Enter username/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders analyze button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /Analyze/i });
  expect(buttonElement).toBeInTheDocument();
});
