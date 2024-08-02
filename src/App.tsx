import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { Canvas } from './CanvasReconciler';

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [shape, setShape] = useState('circle');
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const moveIntervalRef = useRef<number | null>(null);

  const moveCircle = useCallback(() => {
    setShape(Math.random() < 0.5 ? 'circle' : 'rect');
    setPosition({
      x: Math.random() * 300,
      y: Math.random() * 300,
    });
  }, []);

  const resetMoveInterval = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
    }
    moveIntervalRef.current = setInterval(moveCircle, 2000);
  }, [moveCircle]);

  const handleCircleClick = useCallback(() => {
    setScore((prevScore) => prevScore + 1);
    moveCircle();
    resetMoveInterval();
  }, [moveCircle, resetMoveInterval]);

  const handleRectClick = useCallback(() => {
    setScore((prevScore) => prevScore - 1);
    moveCircle();
    resetMoveInterval();
  }, [moveCircle, resetMoveInterval]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!gameOver) {
      resetMoveInterval();
    } else if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
    }

    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, [gameOver, resetMoveInterval]);

  return (
    <Canvas>

      <canvasRect x={0} y={0} width={500} height={100} color="green">
        <canvasText
          x={10}
          y={30}
          text={`Score: ${score}`}
          color="black"
          font="20px Arial"
        />
        <canvasText
          x={10}
          y={60}
          text={`Time: ${timeLeft}s`}
          color="black"
          font="20px Arial"
        />
      </canvasRect>

      <canvasRect x={0} y={100} width={500} height={500} color="lightgray">
        {gameOver ? (
          <canvasText
            x={100}
            y={200}
            text={`Game Over! Final Score: ${score}`}
            color="red"
            font="24px Arial"
          />
        ) : shape === 'circle' ? (
          <canvasCircle
            x={position.x}
            y={position.y}
            radius={20}
            color="blue"
            onClick={handleCircleClick}
          />
        ) : (
          <canvasRect
            x={position.x}
            y={position.y}
            width={40}
            height={40}
            color="blue"
            onClick={handleRectClick}
          />
        )}
      </canvasRect>
    </Canvas>
  );
};

export default App;