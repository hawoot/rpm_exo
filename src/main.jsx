// main.jsx - The entry point of your React app
// Similar to if __name__ == "__main__" in Python

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// This finds the <div id="root"> in index.html and renders your App inside it
// Think of it as: document.getElementById('root').innerHTML = App.render()
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
