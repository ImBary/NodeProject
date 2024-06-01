const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const api = require('./api');

const checkProductQuantity = async (req, res, next) => {
    const prodId = req.params.id;
    const { ilosc } = req.body;
    console.log("ilosc mw: "+ ilosc);
    console.log("prod id: "+prodId);

    try {
        const prods = await api.getProductById(prodId);
        const prod = prods[0];
        const cartProd = await api.getProdFromCartByProdId(prodId);
        const cProd = cartProd[0]
        
        if (!prod) {
            return res.status(404).send("Product not found");
        }

        if (Number(ilosc) > Number(prod.ilosc)) {
            
            return res.status(400).send(`Requested quantity exceeds available stock. Available: ${prod.ilosc}`);
        }
        const prodNew = Number(prod.ilosc) - (Number(ilosc))
        if(ilosc=='Number' || ilosc>0){
            await api.updateCountOfProducts(prodId,prodNew);
            console.log("req body"+ req.ilosc);
            req.ilosc = Number(ilosc) + Number(cProd.ilosc);
        }else{
            req.ilosc = 0;
        }
        req.product = prod;
        req.prodId = prodId;
        next(); 
    } catch (err) {
        console.error("Error checking product quantity: ", err);
        res.status(500).send("Internal Server Error");
    }
};

const handleUser = async(req, res, next) =>{
    let userName = 'Nieznajomy'; 

    if (req.session.user) {
        userName = req.session.user;
    } else if (req.cookies.userName) {
        userName = req.cookies.userName; 
        req.session.user = userName;
    }
    req.userName = userName;
    next();
}

const checkQuantityOfCartProduct = async(req,res,next)=>{
    const prodId = req.params.id;
    const { ilosc } = req.body;
    console.log("ilosc2 mw "+ilosc);
    const cartProduct = await api.getProdFromCartByProdId(prodId-1);
    console.log("cartProduct: "+JSON.stringify(cartProduct))
    const product = cartProduct[0];

    if(!product){
        res.status(400,"Error, nie można znaleźć produktu.");
    }

    if(ilosc!='Number' || Number(ilosc)<0){
        res.status(400,"Error, niepoprawna wartość koszyka.")
    }

    if(Number(ilosc)>Number(product.ilosc)){
        res.status(400,"Error, nie ma tylu produktów.")
    }

    const newValue = Number(product.ilosc)-Number(ilosc);
    req.newValue = newValue;
    req.prodId = prodId-1;
    next();
}

module.exports={
    checkQuantityOfCartProduct,
    handleUser,
    checkProductQuantity
}