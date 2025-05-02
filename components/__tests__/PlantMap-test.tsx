import React from 'react';
import { render } from '@testing-library/react-native';
import PlantMap from '../plant_info/PlantMap';

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn().mockReturnValue(true),
  useFonts: jest.fn().mockReturnValue([true, null]),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock MapView and its components
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
      <View testID="map-view" {...props}>{children}</View>
    ),
    Marker: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
      <View testID="map-marker" {...props}>{children}</View>
    ),
  };
});

describe('PlantMap', () => {
  const mockMapRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const mockObservations = [
    { location: [-122.4324, 37.78825] },
    { location: [-122.4325, 37.78826] },
    { location: [-122.4326, 37.78827] },
  ];

  const invalidObservations = [
    { location: [-200, 37.78825] }, // Invalid longitude
    { location: [-122.4324, 100] }, // Invalid latitude
    { location: [37.78825] }, // Missing coordinate
    { location: [200, 200] }, // Both coordinates invalid
  ];

  it('renders correctly with valid observations', () => {
    const { getByText, getAllByTestId } = render(
      <PlantMap
        observations={mockObservations}
        mapRegion={mockMapRegion}
        loading={false}
      />
    );

    expect(getByText('Observation Locations')).toBeTruthy();
    expect(getAllByTestId('map-marker')).toHaveLength(3);
  });

  it('shows loading state when loading is true', () => {
    const { getByText, getByTestId } = render(
      <PlantMap
        observations={mockObservations}
        mapRegion={mockMapRegion}
        loading={true}
      />
    );

    expect(getByText('Loading observation map...')).toBeTruthy();
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('applies correct styles to the section', () => {
    const { getByTestId } = render(
      <PlantMap
        observations={mockObservations}
        mapRegion={mockMapRegion}
        loading={false}
      />
    );

    const section = getByTestId('map-section');
    expect(section.props.style).toMatchObject({
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    });
  });

  it('applies correct styles to the map container', () => {
    const { getByTestId } = render(
      <PlantMap
        observations={mockObservations}
        mapRegion={mockMapRegion}
        loading={false}
      />
    );

    const mapContainer = getByTestId('map-container');
    expect(mapContainer.props.style).toMatchObject({
      borderRadius: 12,
      overflow: 'hidden',
      height: 240,
    });
  });

  it('limits the number of markers to 100', () => {
    const manyObservations = Array(150).fill({ location: [-122.4324, 37.78825] });
    
    const { getAllByTestId } = render(
      <PlantMap
        observations={manyObservations}
        mapRegion={mockMapRegion}
        loading={false}
      />
    );

    expect(getAllByTestId('map-marker')).toHaveLength(100);
  });
}); 