import { ArrowRight, FileStack, History, Link, Share2, SquareTerminal } from 'lucide-react';

export const Icons = {
  SquareTerminal: SquareTerminal,
  History: History,
  FileStack: FileStack,
  Connect: Share2,
  Integration: Link,
  ArrowRight: ArrowRight,
};

export type IconName = keyof typeof Icons;
