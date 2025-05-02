import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import PlantChatModal from '../plant_info/PlantChatModal';
import { askPlantQuestion } from '../../services/geminiService';

// Mock the geminiService
jest.mock('../../services/geminiService', () => ({
  askPlantQuestion: jest.fn(),
}));

describe('PlantChatModal', () => {
  const mockPlantName = 'Rosa canina';
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <PlantChatModal
        plantName={mockPlantName}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Gemini Chat')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
    expect(getByPlaceholderText('Ask about this plant...')).toBeTruthy();
    expect(getByText('Send')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(
      <PlantChatModal
        plantName={mockPlantName}
        visible={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates input text when typing', () => {
    const { getByPlaceholderText } = render(
      <PlantChatModal
        plantName={mockPlantName}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const input = getByPlaceholderText('Ask about this plant...');
    fireEvent.changeText(input, 'What is this plant?');
    expect(input.props.value).toBe('What is this plant?');
  });

  it('sends message and updates chat when send button is pressed', async () => {
    const mockResponse = 'This is a test response';
    (askPlantQuestion as jest.Mock).mockResolvedValue(mockResponse);

    const { getByPlaceholderText, getByText, findByText } = render(
      <PlantChatModal
        plantName={mockPlantName}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const input = getByPlaceholderText('Ask about this plant...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'What is this plant?');
    await act(async () => {
      fireEvent.press(sendButton);
    });

    expect(askPlantQuestion).toHaveBeenCalledWith(
      mockPlantName,
      'What is this plant?',
      expect.any(Array)
    );
    expect(await findByText('What is this plant?')).toBeTruthy();
    expect(await findByText(mockResponse)).toBeTruthy();
  });

  it('shows error message when API call fails', async () => {
    (askPlantQuestion as jest.Mock).mockRejectedValue(new Error('API Error'));

    const { getByPlaceholderText, getByText, findByText } = render(
      <PlantChatModal
        plantName={mockPlantName}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const input = getByPlaceholderText('Ask about this plant...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'What is this plant?');
    await act(async () => {
      fireEvent.press(sendButton);
    });

    expect(await findByText('Error occurred. Try again.')).toBeTruthy();
  });

  it('disables input and send button while sending', async () => {
    const { getByPlaceholderText, getByText } = render(
      <PlantChatModal
        plantName={mockPlantName}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const input = getByPlaceholderText('Ask about this plant...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'What is this plant?');
    
    // Mock the API call to take some time
    (askPlantQuestion as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('response'), 100))
    );

    await act(async () => {
      fireEvent.press(sendButton);
      // Wait for the sending state to be set
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify input is disabled
    expect(input.props.editable).toBe(false);
    
    // Verify button is disabled by checking if pressing it again doesn't trigger the API call
    const initialCallCount = (askPlantQuestion as jest.Mock).mock.calls.length;
    fireEvent.press(sendButton);
    expect((askPlantQuestion as jest.Mock).mock.calls.length).toBe(initialCallCount);
  });

  it('applies correct styles to chat bubbles', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <PlantChatModal
        plantName={mockPlantName}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const input = getByPlaceholderText('Ask about this plant...');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'What is this plant?');
    await act(async () => {
      fireEvent.press(sendButton);
    });

    const userMessage = await findByText('What is this plant?');
    expect(userMessage.props.style).toMatchObject({
      alignSelf: 'flex-end',
      color: '#fff',
      marginBottom: 8,
    });
  });
}); 