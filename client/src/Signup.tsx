import React, {useContext, useState} from "react";
import AuthService from "./services/AuthService";
import {RouteComponentProps} from "react-router";
import {AuthContext} from "./AuthContext";

const Signup: React.FC<RouteComponentProps<{}>> = (props: RouteComponentProps) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const auth = useContext(AuthContext)

    if (auth.isAuthenticated) props.history.replace("/")

    const onSubmit = () => {
        auth.requestAuth(email, password, "create")
    }

    const button = (auth.isAuthenticating)
        ? <div data-uk-spinner={true}></div>
        : <button className="uk-button-default uk-button" onClick={onSubmit}>Sign Up</button>

    return (
        <div className={"uk-margin-left uk-margin-right uk-margin-top"}>
            <h2>Registration</h2>
            <form>
                <fieldset className="uk-fieldset">
                    <div className="uk-margin">
                        <input autoComplete={"email"} className="uk-input" type="text" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="uk-margin">
                        <input autoComplete={"new-password"} className="uk-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <div className="uk-margin">
                        {button}
                    </div>
                </fieldset>
            </form>
        </div>
    );
}

export default Signup