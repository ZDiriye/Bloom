import React from 'react';
import { render } from '@testing-library/react-native';
import { LeaderboardHeader } from '../leaderboard/LeaderboardHeader';
import { LeaderboardItem } from '../leaderboard/LeaderboardItem';

describe('Leaderboard Components', () => {
  describe('LeaderboardHeader', () => {
    it('renders correctly with all headers', () => {
      const { getByText } = render(<LeaderboardHeader />);
      
      expect(getByText('Leaderboard')).toBeTruthy();
      expect(getByText('Top plant identifiers')).toBeTruthy();
      expect(getByText('Rank')).toBeTruthy();
      expect(getByText('User')).toBeTruthy();
      expect(getByText('Stats')).toBeTruthy();
    });
  });

  describe('LeaderboardItem', () => {
    const mockUser = {
      userId: '123',
      username: 'JohnDoe',
      xp: 1500,
      rank: 1,
      photoURL: 'https://example.com/photo.jpg',
      onPress: jest.fn()
    };

    it('renders correctly with provided data', () => {
      const { getByText, getByTestId } = render(
        <LeaderboardItem {...mockUser} />
      );

      expect(getByText('JohnDoe')).toBeTruthy();
      expect(getByText('1,500XP')).toBeTruthy();
      expect(getByTestId('profile-image')).toBeTruthy();
    });

    it('shows medal emoji for top 3 ranks', () => {
      const { getByText } = render(
        <LeaderboardItem {...mockUser} rank={1} />
      );
      expect(getByText('🥇')).toBeTruthy();

      const { getByText: getByText2 } = render(
        <LeaderboardItem {...mockUser} rank={2} />
      );
      expect(getByText2('🥈')).toBeTruthy();

      const { getByText: getByText3 } = render(
        <LeaderboardItem {...mockUser} rank={3} />
      );
      expect(getByText3('🥉')).toBeTruthy();
    });


    it('formats XP with commas for large numbers', () => {
      const { getByText } = render(
        <LeaderboardItem {...mockUser} xp={1000000} />
      );
      expect(getByText('1,000,000XP')).toBeTruthy();
    });
  });
}); 