import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RegisterForm } from '../auth/RegisterForm';

describe('RegisterForm', () => {
  const mockProps = {
    displayName: '',
    email: '',
    password: '',
    loading: false,
    error: '',
    onDisplayNameChange: jest.fn(),
    onEmailChange: jest.fn(),
    onPasswordChange: jest.fn(),
    onRegister: jest.fn(),
    onLogin: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByTestId } = render(<RegisterForm {...mockProps} />);
    
    expect(getByPlaceholderText('User Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByTestId('create-account-button')).toBeTruthy();
    expect(getByTestId('login-link')).toBeTruthy();
  });

  it('handles display name input change', () => {
    const { getByPlaceholderText } = render(<RegisterForm {...mockProps} />);
    const displayNameInput = getByPlaceholderText('User Name');
    
    fireEvent.changeText(displayNameInput, 'John Doe');
    expect(mockProps.onDisplayNameChange).toHaveBeenCalledWith('John Doe');
  });

  it('handles email input change', () => {
    const { getByPlaceholderText } = render(<RegisterForm {...mockProps} />);
    const emailInput = getByPlaceholderText('Email');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(mockProps.onEmailChange).toHaveBeenCalledWith('test@example.com');
  });

  it('handles password input change', () => {
    const { getByPlaceholderText } = render(<RegisterForm {...mockProps} />);
    const passwordInput = getByPlaceholderText('Password');
    
    fireEvent.changeText(passwordInput, 'password123');
    expect(mockProps.onPasswordChange).toHaveBeenCalledWith('password123');
  });

  it('calls onRegister when create account button is pressed', () => {
    const { getByTestId } = render(<RegisterForm {...mockProps} />);
    const createAccountButton = getByTestId('create-account-button');
    
    fireEvent.press(createAccountButton);
    expect(mockProps.onRegister).toHaveBeenCalled();
  });

  it('calls onLogin when login link is pressed', () => {
    const { getByTestId } = render(<RegisterForm {...mockProps} />);
    const loginLink = getByTestId('login-link');
    
    fireEvent.press(loginLink);
    expect(mockProps.onLogin).toHaveBeenCalled();
  });

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Registration failed';
    const { getByText } = render(
      <RegisterForm {...mockProps} error={errorMessage} />
    );
    
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('disables create account button when loading is true', () => {
    const { getByTestId } = render(
      <RegisterForm {...mockProps} loading={true} />
    );
    
    const createAccountButton = getByTestId('create-account-button');
    expect(createAccountButton.props.accessibilityState.disabled).toBe(true);
  });
}); 