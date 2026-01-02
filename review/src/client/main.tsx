import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('xray-root')!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
