import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileContainer } from '../profile/ProfileContainer';
import { ProfileHeader } from '../profile/ProfileHeader';
import { ProfileStats } from '../profile/ProfileStats';

describe('Profile Components', () => {
  const mockProfileData = {
    profilePic: 'https://example.com/profile.jpg',
    displayName: 'John Doe',
    level: 5,
    stats: [
      { label: 'Plants', value: 12 },
      { label: 'Collections', value: 3 },
      { label: 'Achievements', value: 8 }
    ]
  };

  describe('ProfileHeader', () => {
    it('renders correctly with provided data', () => {
      const { getByText, getByTestId } = render(
        <ProfileHeader
          profilePic={mockProfileData.profilePic}
          displayName={mockProfileData.displayName}
          level={mockProfileData.level}
        />
      );

      expect(getByText(mockProfileData.displayName)).toBeTruthy();
      expect(getByText(`Level ${mockProfileData.level}`)).toBeTruthy();
      expect(getByTestId('profile-image')).toBeTruthy();
    });
  });

  describe('ProfileStats', () => {
    it('renders all stats correctly', () => {
      const { getByText } = render(
        <ProfileStats stats={mockProfileData.stats} />
      );

      mockProfileData.stats.forEach(stat => {
        expect(getByText(stat.label)).toBeTruthy();
        expect(getByText(stat.value.toString())).toBeTruthy();
      });
    });
  });

  describe('ProfileContainer', () => {
    it('renders all profile components correctly', () => {
      const { getByText, getByTestId } = render(
        <ProfileContainer
          profilePic={mockProfileData.profilePic}
          displayName={mockProfileData.displayName}
          level={mockProfileData.level}
          stats={mockProfileData.stats}
          actions={[]}
        />
      );

      // Check if main components are rendered
      expect(getByText(mockProfileData.displayName)).toBeTruthy();
      expect(getByText(`Level ${mockProfileData.level}`)).toBeTruthy();
      
      // Check if stats are rendered
      mockProfileData.stats.forEach(stat => {
        expect(getByText(stat.label)).toBeTruthy();
        expect(getByText(stat.value.toString())).toBeTruthy();
      });
    });
  });
}); 