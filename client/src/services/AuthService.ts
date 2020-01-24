class AuthService {
    static isAuthenticated: boolean
    static isAdmin: boolean
    static token: string|undefined
    static userId: number|undefined

    static requestAuth (email: string, password: string, action: string): Promise<any> {
        return fetch(process.env.REACT_APP_API_ENDPOINT + "/auth/" + action,
            {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "email": email,
                    "password": password
                })
            })
            .then(response => response.json())
            .then(r => {
                AuthService.isAuthenticated=true
                AuthService.isAdmin=r.user.isAdmin
                AuthService.token=r.user.token
                AuthService.userId=r.user.id
                return r;
            })
    }
}

export default AuthService