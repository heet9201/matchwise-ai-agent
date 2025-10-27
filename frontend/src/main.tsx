import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import InfrastructureTest from './InfrastructureTest'
import './index.css'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

// Set to true to test infrastructure components, false for main app
const TEST_MODE = false

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {TEST_MODE ? <InfrastructureTest /> : <App />}
    </React.StrictMode>,
)
