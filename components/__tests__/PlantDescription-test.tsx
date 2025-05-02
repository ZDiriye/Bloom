import React from 'react';
import { render } from '@testing-library/react-native';
import PlantDescription from '../plant_info/PlantDescription';

describe('PlantDescription', () => {
  const mockDescription = 'This is a test plant description.';
  const mockHtmlDescription = '<p>This is a <b>test</b> plant description.</p>';

  it('renders correctly with the given description', () => {
    const { getByText } = render(
      <PlantDescription description={mockDescription} />
    );
    expect(getByText('Description')).toBeTruthy();
    expect(getByText(mockDescription)).toBeTruthy();
  });

  it('removes HTML tags from the description', () => {
    const { getByText } = render(
      <PlantDescription description={mockHtmlDescription} />
    );
    expect(getByText('This is a test plant description.')).toBeTruthy();
  });

  it('applies correct styles to the section', () => {
    const { getByTestId } = render(
      <PlantDescription description={mockDescription} />
    );
    const section = getByTestId('description-section');
    expect(section.props.style).toMatchObject({
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    });
  });

  it('applies correct styles to the title and description text', () => {
    const { getByText } = render(
      <PlantDescription description={mockDescription} />
    );
    const title = getByText('Description');
    const description = getByText(mockDescription);
    
    expect(title.props.style).toMatchObject({
      fontSize: 18,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 16,
    });
    
    expect(description.props.style).toMatchObject({
      fontSize: 15,
      lineHeight: 22,
      color: '#f0f0f0',
    });
  });
}); 