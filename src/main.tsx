
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure the root container has a background that fills the entire viewport
const rootElement = document.getElementById("root")!
rootElement.style.width = "100%"
rootElement.style.height = "100vh"
rootElement.style.margin = "0"
rootElement.style.padding = "0"

createRoot(rootElement).render(<App />);
