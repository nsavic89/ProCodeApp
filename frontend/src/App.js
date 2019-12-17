import React, { Suspense} from 'react';
import Main from './views/Main';
import { BrowserRouter } from 'react-router-dom';
import './app.css';
import { Switch, Route } from 'react-router-dom';
import Login from './views/Login';

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback="loading">
                <Switch>
                    <Route exact path="/login" component={Login} />
                    <Route path="/" component={Main} />
                </Switch>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
