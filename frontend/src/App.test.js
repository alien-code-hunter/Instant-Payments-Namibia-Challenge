import { render, screen } from '@testing-library/react';
import App from './App';

test('renders payment form heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /IPN P2P Payment/i });
  expect(heading).toBeInTheDocument();
});

test('renders all required form fields', () => {
  render(<App />);
  expect(screen.getByLabelText(/Sender Account Number/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Receiver Account Number/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Payment Reference/i)).toBeInTheDocument();
});

test('renders submit button', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /Submit Payment/i })).toBeInTheDocument();
});
