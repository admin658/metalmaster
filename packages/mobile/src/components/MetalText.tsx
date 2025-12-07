import React from 'react';
import { Text, TextProps } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const MetalText = ({ style, className = '', ...props }: TextProps & { className?: string }) => (
  <Text
    style={style}
    className={twMerge('text-gray-100 font-bold', className)}
    {...props}
  />
);
