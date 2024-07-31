import React, { useState } from 'react';

import './App.css';

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

// Custom components for shapes
const Rect: React.FC<Omit<Rect, 'type'> & { onClick: () => void }> = (props) => {
  return <rect {...props} />;
};

const Circle: React.FC<Omit<Circle, 'type'> & { onClick: () => void }> = (props) => {
  return <circle {...props} />;
};

const App: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([
    { type: 'rect', id: 1, x: 10, y: 10, width: 50, height: 50, color: 'red' },
    { type: 'circle', id: 2, x: 100, y: 100, radius: 25, color: 'blue' },
  ]);

  const handleClick = (id: number) => {
    setShapes(shapes.filter(shape => {
      console.log(shape.id, id);
      return shape.id !== id;
    }));
  };

  const addShape = () => {
    const newShape: Shape = Math.random() > 0.5
      ? {
          type: 'rect',
          id: Date.now(),
          x: Math.random() * 280,
          y: Math.random() * 280,
          width: 50,
          height: 50,
          color: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`,
        }
      : {
          type: 'circle',
          id: Date.now(),
          x: Math.random() * 280,
          y: Math.random() * 280,
          radius: 25,
          color: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`,
        };
    setShapes([...shapes, newShape]);
  };

  return (
    <>
      {shapes.map(shape => {
        if (shape.type === 'rect') {
          return (
            <Rect
              key={shape.id}
              id={shape.id}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              color={shape.color}
              onClick={handleClick}
            />
          );
        } else {
          return (
            <Circle
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
      <rect x={0} y={290} width={300} height={20} color="lightgray" />
      <text x={10} y={300} color="black" onClick={addShape} text="text" font="Arial" />
    </>
  );
};

export default App;