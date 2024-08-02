import { createRoot } from 'react-dom/client';
import App from './App.tsx'
import './index.css'
// import { render } from './CanvasReconciler';

createRoot(document.getElementById('root') as HTMLDivElement).render(<App />);

// render(<App />, document.getElementById('root') as HTMLCanvasElement);
