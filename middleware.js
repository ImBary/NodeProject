
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const api = require('./api/api');

const handleUser = async (req, res, next) => {//middleware do sprawdzania czy user zalogowany
    let userName = 'nieznajomy';

    if (req.session.user) {
        userName = req.session.user;
    } else if (req.cookies.userName) {
        userName = req.cookies.userName;
        req.session.user = userName;
    }

    req.userName = userName; 
    next();
};

const validatePassword = async(req,res,next)=>{
    const {username, code} = req.body;
    console.log(username);
    console.log(code);
    if (code.length < 4) {
        return res.status(400).send("Password too short");
    }
    if(code == username){
        return res.status(400).send("Password and Name can't be the same");
    }
    if (username.includes(' ')) {
        return res.status(400).send("Name cannot contain only spaces");
    }
    if (code.includes(' ')) {
        return res.status(400).send("Password cannot contain only spaces");
    }
    if(username=="nieznajomy"){
        return res.status(400).send("invalid username");
    }
    if(await api.getUserByUsername(username)){
        req.flash('error', 'Username already exists');
        return res.redirect('/login');
        
    }
    req.code = code;
    req.name = username;
    next();
};

module.exports={
    handleUser,
    validatePassword
}