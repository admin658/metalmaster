import React from 'react';
import { MetalContainer } from '../components/MetalContainer';
import { MetalText } from '../components/MetalText';

export default function JamScreen() {
  return (
    <MetalContainer>
      <MetalText className="text-2xl mt-8">Jam Tracks</MetalText>
      <MetalText className="mt-2">Play along with metal jam tracks.</MetalText>
    </MetalContainer>
  );
}
