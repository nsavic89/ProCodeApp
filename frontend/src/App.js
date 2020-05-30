import React from 'react';
import './App.css';
import Main from './views/Main';
import UserContextProvider from './contexts/UserContext';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Login from './views/Login';

function App() {
    return (
        <div className="App">
            <UserContextProvider>
                <BrowserRouter>
                    <Switch>
                        <Route path="/login" component={Login} />
                        <Route path="/" exact component={Main} />
                    </Switch>
                </BrowserRouter>
            </UserContextProvider>
        </div>
    );
}

export default App;
