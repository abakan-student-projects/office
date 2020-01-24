import React from "react";

export const AuthContext = React.createContext<{
    isAuthenticated: boolean,
    isAuthenticating: boolean,
    isAdmin: boolean,
    token: string|undefined,
    userId: number|undefined,
    requestAuth: (email: string, password: string, action: string) => Promise<any>
}>({
    isAuthenticated: false,
    isAdmin: false,
    token: undefined,
    userId: undefined,
    isAuthenticating: false,
    requestAuth: (email: string, password: string, action: string) => { return Promise.resolve(false) }
})