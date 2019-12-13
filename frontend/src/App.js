import React, { Suspense} from 'react';
import Home from './views/Home';


function App() {
    return (
        <Suspense fallback="loading">
            <Home />
        </Suspense>
    );
}

export default App;
