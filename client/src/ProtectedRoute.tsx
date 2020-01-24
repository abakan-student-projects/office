import * as React from 'react';
import {Redirect, Route, RouteProps} from 'react-router';
import AuthService from "./services/AuthService";

export class ProtectedRoute extends Route<RouteProps> {
    public render() {
        if (!AuthService.isAuthenticated) {
            const renderComponent = () => (<Redirect to={{pathname: "/login"}}/>);
            return <Route {...this.props} component={renderComponent} render={undefined}/>;
        } else {
            return <Route {...this.props}/>;
        }
    }
}