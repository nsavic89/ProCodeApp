import React, { Suspense} from 'react';
import Main from './views/Main';
import { BrowserRouter } from 'react-router-dom';
import './app.css';
import { Switch, Route } from 'react-router-dom';
import Login from './views/Login';
import UserDataContextProvider from './contexts/UserDataContext';

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback="loading">
                <Switch>
                    <Route exact path="/login" component={Login} />
                
                    <UserDataContextProvider>
                        <Route path="/" component={Main} />
                    </UserDataContextProvider>
                </Switch>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
