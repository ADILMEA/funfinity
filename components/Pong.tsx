"use client";

import { updateHighscore } from "@/db/queries";
import React, { useState, useEffect, useRef, useCallback } from "react";

export const Pong = ({
  prevHighScore,
  clerkId,
}: {
  prevHighScore: number;
  clerkId: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Responsive canvas dimensions
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 500,
    height: 600,
    scale: 1,
  });

  const gameStateRef = useRef({
    isRunning: false,
    ball: { x: 250, y: 300, dx: 4, dy: 4, size: 10 },
    paddle: { x: 210, y: 580, width: 80, height: 15 },
    score: 0,
    startTime: 0,
  });

  const [isGameActive, setIsGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(prevHighScore);
  const [gameOver, setGameOver] = useState(false);

  // Calculate responsive canvas size
  const updateCanvasSize = useCallback(() => {
    const maxWidth = Math.min(window.innerWidth - 32, 500); // 16px padding on each side
    const maxHeight = Math.min(window.innerHeight - 200, 600); // Reserve space for UI

    // Maintain aspect ratio (5:6)
    const aspectRatio = 5 / 6;
    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    const scale = width / 500; // Scale factor based on original width

    setCanvasDimensions({ width, height, scale });

    // Update game state dimensions
    const state = gameStateRef.current;
    state.ball.x = state.ball.x * (width / 500);
    state.ball.y = state.ball.y * (height / 600);
    state.paddle.x = state.paddle.x * (width / 500);
    state.paddle.y = state.paddle.y * (height / 600);
    state.paddle.width = state.paddle.width * scale;
    state.paddle.height = state.paddle.height * scale;
    state.ball.size = state.ball.size * scale;
  }, []);

  const resetGame = useCallback(() => {
    const { width, height, scale } = canvasDimensions;
    const state = gameStateRef.current;

    state.ball = {
      x: width / 2,
      y: height / 2,
      dx: 7 * scale,
      dy: 7 * scale,
      size: 10 * scale,
    };
    state.paddle = {
      x: (width - 80 * scale) / 2,
      y: height - 20 * scale,
      width: 80 * scale,
      height: 15 * scale,
    };
    state.score = 0;
    state.startTime = Date.now();
    setScore(0);
    setGameOver(false);
  }, [canvasDimensions]);

  const startGame = useCallback(() => {
    resetGame();
    setIsGameActive(true);
    gameStateRef.current.isRunning = true;
    // Reset timing reference
    lastTimeRef.current = 0;
  }, [resetGame]);

  const stopGame = useCallback(async () => {
    setIsGameActive(false);

    if (score > highScore) {
      console.log("updating");
      const newHighScore = await updateHighscore({
        highScore: score,
        clerkID: clerkId,
      });
      console.log(newHighScore);
      setHighScore(newHighScore);
    }

    gameStateRef.current.isRunning = false;
    setGameOver(true);
  }, [score, highScore, clerkId]);

  const updatePaddlePosition = useCallback(
    (clientX: number) => {
      if (!gameStateRef.current.isRunning) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const state = gameStateRef.current;
      const { width } = canvasDimensions;

      // Scale the position
      const scaledX = (x / rect.width) * width;

      state.paddle.x = Math.max(
        0,
        Math.min(scaledX - state.paddle.width / 2, width - state.paddle.width)
      );
    },
    [canvasDimensions]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      updatePaddlePosition(e.clientX);
    },
    [updatePaddlePosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      if (e.touches.length > 0) {
        updatePaddlePosition(e.touches[0].clientX);
      }
    },
    [updatePaddlePosition]
  );

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      if (!isGameActive && e.touches.length > 0) {
        startGame();
      }
    },
    [isGameActive, startGame]
  );

  // Game timing refs
  const lastTimeRef = useRef<number>(0);
  const targetFPS = 60;
  const targetFrameTime = 1000 / targetFPS; // 16.67ms

  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!gameStateRef.current.isRunning) return;

      // Initialize lastTime on first frame
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Skip frames that are too fast (prevents micro-stutters)
      if (deltaTime < 1) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Cap delta time to prevent huge jumps (spiral of death protection)
      const clampedDelta = Math.min(deltaTime, 50);

      // Calculate time multiplier to maintain consistent 60 FPS speed
      const timeMultiplier = clampedDelta / targetFrameTime;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const state = gameStateRef.current;
      const { width, height, scale } = canvasDimensions;

      // Calculate speed multiplier based on game time (increases 10% every 10 seconds)
      const timeElapsed = (Date.now() - state.startTime) / 1000;
      const speedMultiplier = 1 + Math.floor(timeElapsed / 10) * 0.1;

      // Update ball position with delta time scaling
      const moveX = state.ball.dx * speedMultiplier * timeMultiplier;
      const moveY = state.ball.dy * speedMultiplier * timeMultiplier;

      state.ball.x += moveX;
      state.ball.y += moveY;

      // Ball collision with left/right walls
      if (
        state.ball.x - state.ball.size <= 0 ||
        state.ball.x + state.ball.size >= width
      ) {
        state.ball.dx = -state.ball.dx;
        state.ball.x =
          state.ball.x <= state.ball.size
            ? state.ball.size
            : width - state.ball.size;
      }

      // Ball collision with top wall
      if (state.ball.y - state.ball.size <= 0) {
        state.ball.dy = -state.ball.dy;
        state.ball.y = state.ball.size;
      }

      // Ball collision with paddle
      if (
        state.ball.y + state.ball.size >= state.paddle.y &&
        state.ball.y - state.ball.size <=
          state.paddle.y + state.paddle.height &&
        state.ball.x >= state.paddle.x &&
        state.ball.x <= state.paddle.x + state.paddle.width &&
        state.ball.dy > 0
      ) {
        state.ball.dy = -Math.abs(state.ball.dy);
        state.ball.y = state.paddle.y - state.ball.size;

        // Add some angle based on where it hit the paddle
        const hitPos =
          (state.ball.x - (state.paddle.x + state.paddle.width / 2)) /
          (state.paddle.width / 2);
        state.ball.dx += hitPos * 2 * scale;

        // Limit ball speed (scale max speed)
        const maxSpeed = 12 * scale;
        if (Math.abs(state.ball.dx) > maxSpeed) {
          state.ball.dx = state.ball.dx > 0 ? maxSpeed : -maxSpeed;
        }

        state.score++;
        setScore(state.score);
      }

      // Game over - ball went off bottom
      if (state.ball.y > height + 20) {
        stopGame();
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, width, height);

      // Draw paddle
      ctx.fillStyle = "#333";
      ctx.fillRect(
        state.paddle.x,
        state.paddle.y,
        state.paddle.width,
        state.paddle.height
      );

      // Draw ball
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.size, 0, Math.PI * 2);
      ctx.fill();

      if (gameStateRef.current.isRunning) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [stopGame, canvasDimensions]
  );

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      updateCanvasSize();
    };

    updateCanvasSize(); // Initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCanvasSize]);

  useEffect(() => {
    if (isGameActive) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isGameActive, gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Mouse events
      canvas.addEventListener("mousemove", handleMouseMove);

      // Touch events
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

      return () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [handleMouseMove, handleTouchMove, handleTouchStart]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col p-4 items-center">
      <div
        ref={containerRef}
        className="relative touch-none select-none"
        onClick={!isGameActive ? startGame : undefined}
        style={{
          width: canvasDimensions.width,
          height: canvasDimensions.height,
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          className="border border-neutral-200 bg-gray-50"
          style={{
            touchAction: "none",
            userSelect: "none",
          }}
        />

        {!isGameActive && (
          <div className="absolute inset-0 flex items-center justify-center tracking-widest text-neutral-600">
            <div className="text-center">
              <div className="text-base sm:text-lg md:text-xl mb-2">
                {gameOver ? "GAME OVER!" : "TAP TO START"}
              </div>
              <div className="text-sm text-neutral-500 hidden sm:block">
                Move mouse or drag to control paddle
              </div>
              <div className="text-sm text-neutral-500 sm:hidden">
                Drag to control paddle
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col sm:flex-row justify-between items-center text-lg sm:text-xl mt-4 gap-2">
        <div className="text-center sm:text-left">
          HIGH SCORE:{" "}
          <span className="font-bold text-blue-600">{highScore}</span>
        </div>
        <div className="text-center sm:text-right">
          SCORE: <span className="font-bold text-green-600">{score}</span>
        </div>
      </div>

      {/* Instructions for mobile */}
      <div className="text-xs text-neutral-500 text-center mt-2 sm:hidden">
        Drag your finger on the game area to move the paddle
      </div>
    </div>
  );
};

export default Pong;
