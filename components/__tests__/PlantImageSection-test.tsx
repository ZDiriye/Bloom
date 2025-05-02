import React from 'react';
import { render } from '@testing-library/react-native';
import PlantImageSection from '../plant_info/PlantImageSection';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

describe('PlantImageSection', () => {
  const mockImageUrl = 'https://example.com/plant.jpg';
  const mockScientificName = 'Rosa canina';
  const mockCommonName = 'Dog Rose';

  it('renders correctly with image, scientific name, and common name', () => {
    const { getByTestId, getByText } = render(
      <PlantImageSection
        imageUrl={mockImageUrl}
        scientificName={mockScientificName}
        commonName={mockCommonName}
      />
    );
    expect(getByTestId('plant-image')).toBeTruthy();
    expect(getByText(mockScientificName)).toBeTruthy();
    expect(getByText(mockCommonName)).toBeTruthy();
  });

  it('renders placeholder when no image URL is provided', () => {
    const { getByTestId } = render(
      <PlantImageSection
        scientificName={mockScientificName}
        commonName={mockCommonName}
      />
    );
    expect(getByTestId('placeholder-image')).toBeTruthy();
  });

  it('shows "No common name" when common name is not provided', () => {
    const { getByText } = render(
      <PlantImageSection
        imageUrl={mockImageUrl}
        scientificName={mockScientificName}
      />
    );
    expect(getByText('No common name')).toBeTruthy();
  });

  it('applies correct styles to the image container', () => {
    const { getByTestId } = render(
      <PlantImageSection
        imageUrl={mockImageUrl}
        scientificName={mockScientificName}
        commonName={mockCommonName}
      />
    );
    const container = getByTestId('image-container');
    expect(container.props.style).toMatchObject({
      height: 260,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      position: 'relative',
    });
  });

  it('applies correct styles to the scientific name', () => {
    const { getByText } = render(
      <PlantImageSection
        imageUrl={mockImageUrl}
        scientificName={mockScientificName}
        commonName={mockCommonName}
      />
    );
    const scientificName = getByText(mockScientificName);
    expect(scientificName.props.style).toMatchObject({
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
    });
  });

  it('applies correct styles to the common name', () => {
    const { getByText } = render(
      <PlantImageSection
        imageUrl={mockImageUrl}
        scientificName={mockScientificName}
        commonName={mockCommonName}
      />
    );
    const commonName = getByText(mockCommonName);
    expect(commonName.props.style).toMatchObject({
      fontSize: 16,
      color: '#ffffff',
      fontStyle: 'italic',
    });
  });
}); 