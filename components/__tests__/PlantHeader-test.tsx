import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlantHeader from '../plant_info/PlantHeader';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('PlantHeader', () => {
  const mockTitle = 'Test Plant';
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with the given title', () => {
    const { getByText } = render(
      <PlantHeader title={mockTitle} onBack={mockOnBack} />
    );
    expect(getByText(mockTitle)).toBeTruthy();
  });

  it('calls onBack when back button is pressed', () => {
    const { getByTestId } = render(
      <PlantHeader title={mockTitle} onBack={mockOnBack} />
    );
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('displays the back button icon', () => {
    const { getByTestId } = render(
      <PlantHeader title={mockTitle} onBack={mockOnBack} />
    );
    const backButton = getByTestId('back-button');
    expect(backButton).toBeTruthy();
  });

  it('applies correct styles to the header', () => {
    const { getByTestId } = render(
      <PlantHeader title={mockTitle} onBack={mockOnBack} />
    );
    const header = getByTestId('plant-header');
    expect(header.props.style).toMatchObject({
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    });
  });
}); 