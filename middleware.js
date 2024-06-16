
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const api = require('./api/api');

const handleUser = async (req, res, next) => {
    let userName = 'nieznajomy';

    if (req.session.user) {
        userName = req.session.user;
    } else if (req.cookies.userName) {
        userName = req.cookies.userName;
        req.session.user = userName;
    }

    req.userName = userName; // Make userName available in req object
    next();
};

const validatePassword = async(req,res,next)=>{
    const {name} = req.body;
    const password = req.code;
    if(password.length < 4){
        return res.status(400).send("Password to short");
    }
    if(password == name){
        return res.status(400).send("Password and Name can't be the same");
    }
    req.code = password;
    next();
};

module.exports={
    handleUser,
    validatePassword
}