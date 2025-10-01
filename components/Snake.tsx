"use client";

import { updateHighscore } from "@/db/queries";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";

export const Snake = ({
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
    height: 500,
    scale: 1,
  });

  const gridSize = 20; // Size of each grid cell
  const gameSpeed = 100; // MS between moves

  const gameStateRef = useRef({
    isRunning: false,
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 15, y: 15 },
    score: 0,
    lastMoveTime: 0,
  });

  const [isGameActive, setIsGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(prevHighScore);
  const [gameOver, setGameOver] = useState(false);

  // Calculate responsive canvas size
  const updateCanvasSize = useCallback(() => {
    const parent = containerRef.current?.parentElement;
    // fallback if parent isn't found
    let availableWidth = window.innerWidth - 32;

    if (parent) {
      const style = getComputedStyle(parent);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      // parent.clientWidth includes padding, so subtract padding to get content width
      availableWidth = Math.max(
        0,
        parent.clientWidth - paddingLeft - paddingRight
      );
    }

    const maxSize = Math.min(availableWidth, window.innerHeight - 250, 500);
    const gridCount = Math.max(1, Math.floor(maxSize / gridSize));
    const size = gridCount * gridSize;
    const scale = size / 500;

    setCanvasDimensions({ width: size, height: size, scale });
  }, [gridSize]);

  const getGridCount = useCallback(() => {
    return Math.floor(canvasDimensions.width / gridSize);
  }, [canvasDimensions.width]);

  const generateFood = useCallback(() => {
    const gridCount = getGridCount();
    const state = gameStateRef.current;

    let foodPos: { x: number; y: number };
    let isOnSnake: boolean;

    do {
      foodPos = {
        x: Math.floor(Math.random() * gridCount),
        y: Math.floor(Math.random() * gridCount),
      };

      isOnSnake = state.snake.some(
        (segment) => segment.x === foodPos.x && segment.y === foodPos.y
      );
    } while (isOnSnake);

    return foodPos;
  }, [getGridCount]);

  const resetGame = useCallback(() => {
    const gridCount = getGridCount();
    const centerX = Math.floor(gridCount / 2);
    const centerY = Math.floor(gridCount / 2);

    const state = gameStateRef.current;
    state.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];
    state.direction = { x: 1, y: 0 };
    state.nextDirection = { x: 1, y: 0 };
    state.food = generateFood();
    state.score = 0;
    state.lastMoveTime = 0;
    setScore(0);
    setGameOver(false);
  }, [getGridCount, generateFood]);

  const startGame = useCallback(() => {
    resetGame();
    setIsGameActive(true);
    gameStateRef.current.isRunning = true;
  }, [resetGame]);

  const stopGame = useCallback(async () => {
    const currentScore = gameStateRef.current.score;

    setIsGameActive(false);
    gameStateRef.current.isRunning = false;
    setGameOver(true);

    console.log("Game stopped with score:", currentScore);
    console.log("Current high score:", highScore);
    console.log("Clerk ID:", clerkId);

    if (currentScore > highScore) {
      try {
        console.log("Attempting to update high score...");
        const newHighScore = await updateHighscore({
          highScore: currentScore,
          clerkID: clerkId,
        });
        console.log("Updated high score:", newHighScore);
        setHighScore(newHighScore);
      } catch (error) {
        console.error("Error updating high score:", error);
      }
    } else {
      console.log("Score not higher than current high score, skipping update");
    }
  }, [highScore, clerkId]);

  const changeDirection = useCallback(
    (newDirection: { x: number; y: number }) => {
      const state = gameStateRef.current;

      // Prevent reversing direction
      if (
        state.direction.x + newDirection.x === 0 &&
        state.direction.y + newDirection.y === 0
      ) {
        return;
      }

      state.nextDirection = newDirection;
    },
    []
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!gameStateRef.current.isRunning) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          changeDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          changeDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          changeDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          changeDirection({ x: 1, y: 0 });
          break;
      }
    },
    [changeDirection]
  );

  // Touch controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      if (!isGameActive) {
        startGame();
        return;
      }

      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [isGameActive, startGame]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || !gameStateRef.current.isRunning) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const minSwipe = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipe) {
          changeDirection(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipe) {
          changeDirection(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
        }
      }

      touchStartRef.current = null;
    },
    [changeDirection]
  );

  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!gameStateRef.current.isRunning) return;

      const state = gameStateRef.current;

      // Check if enough time has passed for next move
      if (currentTime - state.lastMoveTime < gameSpeed) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      state.lastMoveTime = currentTime;
      state.direction = state.nextDirection;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const gridCount = getGridCount();
      const head = state.snake[0];

      // Calculate new head position with wrapping
      let newX = head.x + state.direction.x;
      let newY = head.y + state.direction.y;

      // Wrap around edges (infinite mode)
      if (newX < 0) newX = gridCount - 1;
      if (newX >= gridCount) newX = 0;
      if (newY < 0) newY = gridCount - 1;
      if (newY >= gridCount) newY = 0;

      const newHead = { x: newX, y: newY };

      // Check collision with self
      if (
        state.snake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        stopGame();
        return;
      }

      // Add new head
      state.snake.unshift(newHead);

      // Check if food eaten
      if (newHead.x === state.food.x && newHead.y === state.food.y) {
        state.score++;
        setScore(state.score);
        state.food = generateFood();
      } else {
        // Remove tail if no food eaten
        state.snake.pop();
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

      // Draw grid
      ctx.strokeStyle = "#e5e5e5";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= gridCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvasDimensions.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvasDimensions.width, i * gridSize);
        ctx.stroke();
      }

      // Draw snake
      state.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#000000" : "#404040";
        ctx.fillRect(
          segment.x * gridSize + 1,
          segment.y * gridSize + 1,
          gridSize - 2,
          gridSize - 2
        );
      });

      // Draw food
      ctx.fillStyle = "#737373";
      ctx.beginPath();
      ctx.arc(
        state.food.x * gridSize + gridSize / 2,
        state.food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      if (gameStateRef.current.isRunning) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [stopGame, canvasDimensions, getGridCount, generateFood]
  );

  // Handle resize
  useLayoutEffect(() => {
    const handleResize = () => {
      updateCanvasSize();
    };

    // set size before paint
    updateCanvasSize();
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
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

      return () => {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [handleTouchStart, handleTouchEnd]);

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
          className="border-2 border-neutral-900 bg-white"
          style={{
            touchAction: "none",
            userSelect: "none",
          }}
        />

        {!isGameActive && (
          <div className="absolute inset-0 flex items-center justify-center tracking-widest text-neutral-900 bg-white bg-opacity-90">
            <div className="text-center bg-white border-2 border-neutral-900 p-6 rounded-lg shadow-lg">
              <div className="text-base sm:text-lg md:text-xl mb-3 font-bold">
                {gameOver ? "GAME OVER!" : "INFINITE SNAKE"}
              </div>
              <div className="text-sm text-neutral-700 mb-2">
                {gameOver ? "Tap to Play Again" : "Tap to Start"}
              </div>
              <div className="text-xs text-neutral-600 hidden sm:block">
                Use arrow keys or WASD to control
              </div>
              <div className="text-xs text-neutral-600 sm:hidden">
                Swipe to control direction
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col sm:flex-row justify-between items-center text-lg sm:text-xl mt-4 gap-2">
        <div className="text-center sm:text-left">
          HIGH SCORE:{" "}
          <span className="font-bold text-neutral-900">{highScore}</span>
        </div>
        <div className="text-center sm:text-right">
          SCORE: <span className="font-bold text-neutral-700">{score}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-neutral-600 text-center mt-3 space-y-1">
        <div className="hidden sm:block">
          Arrow keys or WASD to move • Edges wrap around infinitely
        </div>
        <div className="sm:hidden">
          Swipe to change direction • Edges wrap around infinitely
        </div>
        <div className="text-neutral-900 font-medium">
          Length: {gameStateRef.current.snake.length}
        </div>
      </div>
    </div>
  );
};

export default Snake;
