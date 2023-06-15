import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider, RoomProvider } from './Contexts.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <LanguageProvider>
            <RoomProvider>
                <App />
            </RoomProvider>
        </LanguageProvider>
    </React.StrictMode>,
)
