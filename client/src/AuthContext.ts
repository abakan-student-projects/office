import React from "react";

export const AuthContext = React.createContext({
    isAuthenticated: false,
    isAdmin: false,
    token: undefined,
    userId: undefined,
    isAuthenticating: false,
    requestAuth: (email: string, password: string, action: string) => {}
})