import React, { Suspense} from 'react';
import Main from './views/Main';
import { BrowserRouter } from 'react-router-dom';
import './app.css';

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback="loading">
                <Main />
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
