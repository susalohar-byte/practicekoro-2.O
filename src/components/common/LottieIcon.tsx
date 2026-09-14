import React from 'react';
import { Lottie } from 'lottie-react';

interface LottieIconProps {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export const LottieIcon: React.FC<LottieIconProps> = ({
  src,
  className = 'w-6 h-6',
  loop = true,
  autoplay = true,
}) => {
  return (
    <Lottie
      src={src}
      loop={loop}
      autoplay={autoplay}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
    />
  );
};
