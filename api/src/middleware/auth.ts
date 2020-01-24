import * as jwt from "express-jwt"


const getTokenFromCookies = (req) => {
    const { cookies: { token } } = req;
    return token;
};

const getTokenFromHeaders = (req) => {
    const { headers: { authorization } } = req;

    if(authorization && authorization.split(' ')[0] === 'Token') {
        return authorization.split(' ')[1];
    }
    return null;
};

const getToken = (req) => {
    let t = getTokenFromCookies(req)
    return (t) ? t : getTokenFromHeaders(req)
}

const auth = {
    required: jwt({
        secret: process.env.OFFICE_JWT_SECRET,
        userProperty: 'payload',
        getToken: getToken,
    }),
    optional: jwt({
        secret: process.env.OFFICE_JWT_SECRET,
        userProperty: 'payload',
        getToken: getToken,
        credentialsRequired: false,
    }),
};

export default auth