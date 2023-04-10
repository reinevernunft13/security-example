const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const { verify } = require('crypto');

require('dotenv').config();

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2
}

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET

}

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    //if the creds passed (accesstoken + refreshtoken) are valid, we call done() to supply passport with the user that authenticated
    //if something goes wrong/the user's creds are invalid we can pass in an error as first option. Here we're assuming there's no error.
    done(null, profile)
}
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))

//saves user session to the cookie
passport.serializeUser((user, done) => {
    done(null, user.id);

});
//reads user session from the cookie
passport.deserializeUser((id, done) => {
    done(null, id);
})

const app = express();
//middleware securing our endpoints by protecting against common config issues
app.use(helmet());

app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2]
}))
//Initialize passport
//function that returns passport middleware that helps us set up passport session
app.use(passport.initialize());
app.use(passport.session());

//middleware
function checkLoggedIn(req, res, next) {
    console.log('Current User: ', req.user);
    const isLoggedIn = req.isAuthenticated() && req.user;
    if(!isLoggedIn) {
        return res.status(401).json({
            error: 'Please, log in.'
        });
    }
    next();
}

app.get('/auth/google', passport.authenticate('google', {
    //which data we're requesting from google when everything succeeds
    scope: ['email'], //'profile' or any data we'll use to fill out a user's info in a db
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true, 
}), 
(req, res) => {
    //we can optionally choose to do here something additional
    //when google call us back (e.g. res.redirect() instead of the props in the options
    console.log('Google called me back!')
});

app.get('/auth/logout', (req, res) => {
    //removes req.user & clear any logged in session
    req.logout();
    return res.redirect('/');

});

app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send('<h1>YAY!:) You accessed protected resources!</h1>');
});

app.get('/failure', (req, res) => {
    return res.send('Failed to log in');
})


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(process.env.API_PORT, () => {
    console.log(`Server listening on port ${process.env.API_PORT}`);
});