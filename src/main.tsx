import App from './App.tsx'
import './index.css'
import { render } from './MyReconciler';

render(<App />, document.getElementById('root') as HTMLCanvasElement);
