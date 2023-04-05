const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');

require('dotenv').config();

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET
}

const AUTH_OPTIONS = {
    callbackURL: 'auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET

}
// verify fn is responsible for authentication, such that if we receive a token,
// we've successfully authenticated
function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    //if the creds passed (accesstoken + refreshtoken) are valid, we call done() to supply passport with the user that authenticated
    //if something goes wrong/the user's creds are invalid we can pass in an error as first option. Here we're assuming there's no error.
    done(null, profile)
}
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback))


const app = express();
//middleware securing our endpoints by protecting against common config issues
app.use(helmet());
//Initialize passport
//function that returns passport middleware that helps us set up passport; i.e: passport session
app.use(passport.initialize());

//middleware
function checkLoggedIn(req, res, next) {
    const isLoggedIn = true; // TODO
    if(!isLoggedIn) {
        return res.status(401).json({
            error: 'Please, log in.'
        });
    }
    next();
}

app.get('/auth/google', (req, res) => {

})

app.get('/auth/google/callback', (req, res) => {
    
})

app.get('/secret', checkLoggedIn, (req, res) => {
    return res.send('Your personal secret value is 12');
});

app.get('/auth/logout', (req, res) => {

});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, app).listen(process.env.API_PORT, () => {
    console.log(`Server listening on port ${process.env.API_PORT}`);
});