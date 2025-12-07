import React from 'react';
import { MetalContainer } from '../components/MetalContainer';
import { MetalText } from '../components/MetalText';

export default function RiffsScreen() {
  return (
    <MetalContainer>
      <MetalText className="text-2xl mt-8">Riffs</MetalText>
      <MetalText className="mt-2">Explore and practice metal riffs.</MetalText>
    </MetalContainer>
  );
}
