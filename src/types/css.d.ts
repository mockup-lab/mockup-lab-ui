// Declaration file for extending CSS properties with vendor prefixes
import 'react';

declare module 'react' {
  interface CSSProperties {
    WebkitBackfaceVisibility?: string;
  }
}