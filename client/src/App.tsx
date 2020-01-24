import '../node_modules/uikit/dist/css/uikit.min.css'
import '../node_modules/uikit/dist/js/uikit.min.js'
import '../node_modules/uikit/dist/js/uikit-icons.min.js'

import React, {useState} from 'react';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";

import Login from "./Login";
import Contractor from "./Contractor";
import Admin from "./Admin";
import Signup from "./Signup";
import {ProtectedRoute} from "./ProtectedRoute";
import { AuthContext } from "./AuthContext";
import AuthService from "./services/AuthService";

require("dotenv").config()

const App: React.FC = () => {

    const requestAuth = (email: string, password: string, action: string) => {
        setAuth({
            isAuthenticated: false,
            isAuthenticating: true,
            isAdmin: false,
            token: undefined,
            userId: undefined,
            requestAuth: requestAuth
        })
        return AuthService.requestAuth(email, password, action)
            .then(r => {
                console.log(r)
                setAuth({
                    isAuthenticated: true,
                    isAuthenticating: false,
                    isAdmin: r.user.isAdmin,
                    token: r.user.token,
                    userId: r.user.id,
                    requestAuth: requestAuth
                })
            })
            .catch(e => {
                setAuth({
                    isAuthenticated: false,
                    isAuthenticating: false,
                    isAdmin: false,
                    token: undefined,
                    userId: undefined,
                    requestAuth: requestAuth
                })
            })
    }

    const [auth, setAuth] = useState({
        isAuthenticated: false,
        isAuthenticating: false,
        isAdmin: false,
        token: undefined,
        userId: undefined,
        requestAuth: requestAuth
    })

    return (
        <Router>
            <AuthContext.Provider value={auth}>
                <div className="App">
                    {/*<nav className="uk-navbar-container" data-uk-navbar={true}>*/}
                    {/*    <div className="uk-navbar-left">*/}
                    {/*        <Link className="uk-navbar-item uk-logo" to="/">Contracts</Link>*/}
                    {/*    </div>*/}
                    {/*</nav>*/}
                    <Switch>
                        <ProtectedRoute exact={true} path="/" component={Contractor}/>
                        <ProtectedRoute exact={true} path="/admin" component={Admin}/>
                        <Route exact={true} path="/login" component={Login}/>
                        <Route exact={true} path="/signup" component={Signup}/>
                    </Switch>
                </div>
            </AuthContext.Provider>
        </Router>
    )
}

export default App