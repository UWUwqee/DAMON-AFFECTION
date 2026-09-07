import React from 'react';
import { ThemeId } from '../../types';
import { BloomingHeartAnimation } from './BloomingHeartAnimation';
import { StarlitPromiseAnimation } from './StarlitPromiseAnimation';
import { WarmthOfUsAnimation } from './WarmthOfUsAnimation';
import { SeasonsOfLoveAnimation } from './SeasonsOfLoveAnimation';
import { OceanOfMyHeartAnimation } from './OceanOfMyHeartAnimation';
import { MoonlitGardenAnimation } from './MoonlitGardenAnimation';
import { SunsetPostcardAnimation } from './SunsetPostcardAnimation';
import { PaperCranesAnimation } from './PaperCranesAnimation';
import { RosewaterRainAnimation } from './RosewaterRainAnimation';
import { HoneyedMorningAnimation } from './HoneyedMorningAnimation';

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
    case 'moonlit-garden':
      return <MoonlitGardenAnimation />;
    case 'sunset-postcard':
      return <SunsetPostcardAnimation />;
    case 'paper-cranes':
      return <PaperCranesAnimation />;
    case 'rosewater-rain':
      return <RosewaterRainAnimation />;
    case 'honeyed-morning':
      return <HoneyedMorningAnimation />;
    default:
      return <BloomingHeartAnimation />;
  }
};
