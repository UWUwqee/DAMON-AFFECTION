import React from 'react';
import { ThemeId } from '../../types';
import { BloomingHeartAnimation } from './BloomingHeartAnimation';
import { StarlitPromiseAnimation } from './StarlitPromiseAnimation';
import { WarmthOfUsAnimation } from './WarmthOfUsAnimation';
import { SeasonsOfLoveAnimation } from './SeasonsOfLoveAnimation';
import { OceanOfMyHeartAnimation } from './OceanOfMyHeartAnimation';

interface Props {
  theme: ThemeId;
}

export const ThemeBackground: React.FC<Props> = ({ theme }) => {
  switch (theme) {
    case 'blooming-heart':
      return <BloomingHeartAnimation />;
    case 'starlit-promise':
      return <StarlitPromiseAnimation />;
    case 'warmth-of-us':
      return <WarmthOfUsAnimation />;
    case 'seasons-of-love':
      return <SeasonsOfLoveAnimation />;
    case 'ocean-of-my-heart':
      return <OceanOfMyHeartAnimation />;
    default:
      return <BloomingHeartAnimation />;
  }
};
