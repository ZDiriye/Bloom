import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LoginForm } from '../auth/LoginForm';

describe('LoginForm', () => {
  const mockProps = {
    email: '',
    password: '',
    loading: false,
    error: '',
    onEmailChange: jest.fn(),
    onPasswordChange: jest.fn(),
    onLogin: jest.fn(),
    onRegister: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByTestId } = render(<LoginForm {...mockProps} />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByTestId('sign-in-button')).toBeTruthy();
    expect(getByTestId('register-link')).toBeTruthy();
  });

  it('handles email input change', () => {
    const { getByPlaceholderText } = render(<LoginForm {...mockProps} />);
    const emailInput = getByPlaceholderText('Email');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(mockProps.onEmailChange).toHaveBeenCalledWith('test@example.com');
  });

  it('handles password input change', () => {
    const { getByPlaceholderText } = render(<LoginForm {...mockProps} />);
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(passwordInput, 'password123');
    expect(mockProps.onPasswordChange).toHaveBeenCalledWith('password123');
  });

  it('calls onLogin when sign in button is pressed', () => {
    const { getByTestId } = render(<LoginForm {...mockProps} />);
    const signInButton = getByTestId('sign-in-button');
    
    fireEvent.press(signInButton);
    expect(mockProps.onLogin).toHaveBeenCalled();
  });

  it('calls onRegister when create account link is pressed', () => {
    const { getByTestId } = render(<LoginForm {...mockProps} />);
    const registerLink = getByTestId('register-link');
    
    fireEvent.press(registerLink);
    expect(mockProps.onRegister).toHaveBeenCalled();
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Invalid credentials';
    const { getByText } = render(
      <LoginForm {...mockProps} error={errorMessage} />
    );
    
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('disables sign in button when loading is true', () => {
    const { getByTestId } = render(
      <LoginForm {...mockProps} loading={true} />
    );
    
    const signInButton = getByTestId('sign-in-button');
    expect(signInButton.props.accessibilityState.disabled).toBe(true);
  });
}); 