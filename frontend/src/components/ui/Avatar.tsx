import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, className, onClick }) => {
  const [imageError, setImageError] = React.useState(false);

  if (src && !imageError) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={cn("object-cover", className)} 
        onError={() => setImageError(true)}
        onClick={onClick}
      />
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center justify-center bg-primary/10 text-primary font-bold uppercase select-none", 
        className
      )}
      onClick={onClick}
    >
      {fallback.slice(0, 2)}
    </div>
  );
};
