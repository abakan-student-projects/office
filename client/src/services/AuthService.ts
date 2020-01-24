import Cookies from "universal-cookie";
import jwtDecode from "jwt-decode"

class AuthService {
    static isAdmin: boolean
    static token: string|undefined
    static userId: number|undefined

    static isAuthenticated() {
        const cookies = new Cookies();
        const token = cookies.get("token")
        if (token) {
            const data: any = jwtDecode(token)
            AuthService.isAdmin = data.isAdmin
            AuthService.userId = data.id
            AuthService.token = token
            return true
        } else {
            return false
        }
    }

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
                const cookies = new Cookies();
                cookies.set("token", r.user.token, { path: "/"})
                AuthService.isAdmin=r.user.isAdmin
                AuthService.token=r.user.token
                AuthService.userId=r.user.id
                return r;
            })
    }
}

export default AuthService