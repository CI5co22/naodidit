import {createRoot} from 'react-dom/client';
import './index.css';
import { AuthGate } from './components/AuthGate';

createRoot(document.getElementById('root')!).render(<AuthGate />);
