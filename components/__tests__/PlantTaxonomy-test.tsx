import React from 'react';
import { render } from '@testing-library/react-native';
import PlantTaxonomy from '../plant_info/PlantTaxonomy';

describe('PlantTaxonomy', () => {
  const mockAncestors = [
    { rank: 'kingdom', name: 'Plantae' },
    { rank: 'phylum', name: 'Tracheophyta' },
    { rank: 'class', name: 'Magnoliopsida' },
  ];
  const mockCurrentSpecies = 'Rosa canina';

  it('renders correctly with ancestors and current species', () => {
    const { getByText } = render(
      <PlantTaxonomy ancestors={mockAncestors} currentSpecies={mockCurrentSpecies} />
    );
    
    // Check section title
    expect(getByText('Taxonomic Classification')).toBeTruthy();
    
    // Check ancestor ranks and names
    expect(getByText('Kingdom')).toBeTruthy();
    expect(getByText('Plantae')).toBeTruthy();
    expect(getByText('Phylum')).toBeTruthy();
    expect(getByText('Tracheophyta')).toBeTruthy();
    expect(getByText('Class')).toBeTruthy();
    expect(getByText('Magnoliopsida')).toBeTruthy();
    
    // Check current species
    expect(getByText('Species')).toBeTruthy();
    expect(getByText('Rosa canina')).toBeTruthy();
  });

  it('renders correctly with empty ancestors array', () => {
    const { getByText } = render(
      <PlantTaxonomy ancestors={[]} currentSpecies={mockCurrentSpecies} />
    );
    
    expect(getByText('Taxonomic Classification')).toBeTruthy();
    expect(getByText('Species')).toBeTruthy();
    expect(getByText('Rosa canina')).toBeTruthy();
  });

  it('applies correct styles to the section', () => {
    const { getByText } = render(
      <PlantTaxonomy ancestors={mockAncestors} currentSpecies={mockCurrentSpecies} />
    );
    
    const section = getByText('Taxonomic Classification').parent?.parent;
    expect(section?.props.style).toMatchObject({
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    });
  });

  it('applies italic styling to species name', () => {
    const { getByText } = render(
      <PlantTaxonomy ancestors={mockAncestors} currentSpecies={mockCurrentSpecies} />
    );
    
    const speciesName = getByText(mockCurrentSpecies);
    expect(speciesName.props.style).toMatchObject({
      fontStyle: 'italic',
    });
  });
}); 