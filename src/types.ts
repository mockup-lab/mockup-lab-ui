export interface TemplateData {
  index: number;
  category: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  tags: string[];
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  trailLength: number;
  history: { x: number; y: number }[];
  reset: () => void;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}