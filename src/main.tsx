import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorsProvider, LanguageProvider, LoadignStateProvider,  UserProvider } from './Contexts.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <LanguageProvider>
            <ErrorsProvider>
                <LoadignStateProvider>
                    <UserProvider>
                        {/* <RoomProvider> */}
                            <App />
                        {/* </RoomProvider> */}
                    </UserProvider>
                </LoadignStateProvider>
            </ErrorsProvider>
        </LanguageProvider>
    </React.StrictMode>,
)
