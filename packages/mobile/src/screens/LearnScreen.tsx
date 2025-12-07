import React from 'react';
import { MetalContainer } from '../components/MetalContainer';
import { MetalText } from '../components/MetalText';

export default function LearnScreen() {
  return (
    <MetalContainer>
      <MetalText className="text-2xl mt-8">Lessons</MetalText>
      <MetalText className="mt-2">Browse and start learning metal guitar techniques.</MetalText>
    </MetalContainer>
  );
}
