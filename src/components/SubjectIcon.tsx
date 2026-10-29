import React from 'react';
import {
  Atom,
  Zap,
  FlaskConical,
  Flame,
  Sigma,
  Compass,
  Leaf,
  HeartPulse,
  Cpu,
  BookOpen,
  Languages,
} from 'lucide-react';

interface Props {
  name: string;
  className?: string;
}

export const SubjectIcon: React.FC<Props> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Atom':
      return <Atom className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Sigma':
      return <Sigma className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Leaf':
      return <Leaf className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Languages':
      return <Languages className={className} />;
    default:
      return <Atom className={className} />;
  }
};
