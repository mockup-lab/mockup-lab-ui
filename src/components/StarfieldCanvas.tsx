import React, { useEffect, useRef } from 'react';
import { Star as StarInterface } from '../types';

class Star implements StarInterface {
  x: number = 0;
  y: number = 0;
  size: number = 0;
  speed: number = 0;
  opacity: number = 0;
  trailLength: number = 0;
  history: { x: number; y: number }[] = [];
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset();
    // Initialize with a random position on the canvas
    this.y = Math.random() * canvasHeight;
    this.history = [];
  }

  reset() {
    this.x = Math.random() * this.canvasWidth;
    this.y = -Math.random() * 50;
    const sizeFactor = Math.random();
    this.size = sizeFactor * 1.5 + 0.5;
    this.speed = sizeFactor * 1.5 + 0.5;
    this.opacity = sizeFactor * 0.5 + 0.3;
    this.trailLength = Math.floor(sizeFactor * 10) + 5;
    this.history = [];
  }

  update() {
    this.y += this.speed;
    this.history.push({ x: this.x, y: this.y });

    if (this.history.length > this.trailLength) {
      this.history.shift();
    }

    if (this.y - this.size > this.canvasHeight) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Save the current context state
    ctx.save();

    // Draw trail
    if (this.history.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.history[0].x, this.history[0].y);

      for (let i = 1; i < this.history.length; i++) {
        const segmentOpacity = (i / this.history.length) * this.opacity * 0.7;
        ctx.lineTo(this.history[i].x, this.history[i].y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${segmentOpacity})`;
        ctx.lineWidth = this.size * (i / this.history.length);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.history[i].x, this.history[i].y);
      }
    }

    // Draw star
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = this.size * 3;
    ctx.fill();

    // Restore the context state
    ctx.restore();
  }
}

const StarfieldCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const setupCanvas = () => {
      // Set canvas dimensions to match window size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Clear existing stars
      starsRef.current = [];

      // Calculate number of stars based on canvas size
      const numStars = Math.floor((canvas.width * canvas.height) / 8000);

      // Create stars
      for (let i = 0; i < numStars; i++) {
        starsRef.current.push(new Star(canvas.width, canvas.height));
      }

      isInitializedRef.current = true;
    };

    const animateStars = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw each star
      starsRef.current.forEach(star => {
        star.update();
        star.draw(ctx);
      });

      // Continue animation loop
      animationFrameIdRef.current = requestAnimationFrame(animateStars);
    };

    // Always setup and start animation when component mounts or re-renders
    // Cancel any existing animation frame first
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    setupCanvas();
    animateStars();

    // Handle window resize
    const handleResize = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      setupCanvas();
      animateStars();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return <canvas id="starfieldCanvas" ref={canvasRef} />;
};

export default StarfieldCanvas;