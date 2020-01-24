import React, {useContext, useState} from "react";
import {RouteComponentProps} from "react-router";
import {Link} from "react-router-dom";
import {AuthContext} from "./AuthContext";

const Login: React.FC<RouteComponentProps<{}>> = (props: RouteComponentProps) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const auth = useContext(AuthContext)

    if (auth.isAuthenticated) props.history.replace("/")

    const onSubmit = () => {
        auth.requestAuth(email, password, "login")
    }

    const button = (auth.isAuthenticating)
        ? <div data-uk-spinner={true}></div>
        : <button className="uk-button-primary uk-button" onClick={onSubmit}>Sign In</button>

    return (
        <div className={"uk-margin-left uk-margin-right uk-margin-top"}>
            <h2>Login to Contracts</h2>
            <form>
                <fieldset className="uk-fieldset">
                    <div className="uk-margin">
                        <input autoComplete={"email"} className="uk-input" type="text" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="uk-margin">
                        <input autoComplete={"current-password"} className="uk-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="uk-margin">
                        <div className={"uk-flex"}>
                            {button}
                            <Link className={"uk-margin-left uk-button uk-button-default"} to={"/signup"}>Sign Up</Link>
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>
    );
}

export default Login