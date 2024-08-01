import React, { useState } from 'react';
import './App.css';
import { Canvas } from './MyReconciler';

type Shape = Rect | Circle;

interface Rect {
  type: 'rect';
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface Circle {
  type: 'circle';
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
}

const App: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([
    { type: 'rect', id: 1, x: 10, y: 10, width: 50, height: 50, color: 'red' },
    { type: 'circle', id: 2, x: 100, y: 100, radius: 25, color: 'blue' },
  ]);
  const [count, setCount] = useState(0);

  const handleClick = (id: number) => {
    setCount((prev) => prev - 1);
    setShapes(shapes.filter(shape => {
      return shape.id !== id;
    }));
  };

  const addShape = () => {
    setCount((prev) => prev + 1);
    const newShape: Shape = Math.random() > 0.5
      ? {
        type: 'rect',
        id: Date.now(),
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        width: 50,
        height: 50,
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
      }
      : {
        type: 'circle',
        id: Date.now(),
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        radius: 25,
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
      };
    setShapes([...shapes, newShape]);
  };

  return (
    <>
      {shapes.map(shape => {
        if (shape.type === 'rect') {
          return (
            <canvasRect
              key={shape.id}
              id={shape.id}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              color={shape.color}
              onClick={() => handleClick(shape.id)}
            />
          );
        } else {
          return (
            <canvasCircle
              key={shape.id}
              id={shape.id}
              x={shape.x}
              y={shape.y}
              radius={shape.radius}
              color={shape.color}
              onClick={addShape}
            />
          );
        }
      })}
      <canvasRect x={10} y={300} width={500} height={20} color="green">
        <canvasText
          x={0}
          y={15}
          text={count.toString()}
          font="16px Arial"
        />
      </canvasRect>
    </>
  );
};

export default App;