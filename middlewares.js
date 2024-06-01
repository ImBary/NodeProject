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
        let prod = prods[0];
        const cartProd = await api.getProdFromCartByProdId(prodId);
        const cProd = cartProd[0]
        
        if (!prod) {
            return res.status(404).send("Product not found");
        }

        if (Number(ilosc) > Number(prod.ilosc)) {
            
            return res.status(400).send(`Requested quantity exceeds available stock. Available: ${prod.ilosc}`);
        }
        const prodNew = Number(prod.ilosc) - (Number(ilosc))
        if(ilosc=='Number' || ilosc>=0){
            await api.updateCountOfProducts(prodId,prodNew);
            const afterUpdate = await api.getProductById(prodId);
            prod = afterUpdate[0];
            req.ilosc = Number(ilosc) + Number(cProd.ilosc);
            console.log("req body"+ req.ilosc);
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
    
    const newAdd = Number(product.ilosc)-Number(ilosc);
    
    req.newAdd = Number(newAdd);
    const newValue = Number(ilosc);
    req.newValue = newValue;
    req.prodId = prodId-1;
    next();
}

const checkValidInput = async (req, res, next) => {
    const { nazwa, cena, ilosc, rodzaj } = req.body;
    console.log("im here");

    if (!nazwa) {
        console.log("zla nazwa");
        return res.status(400).json({ error: "Error: pusta nazwa" });
    }

    const regex = /^\d{1,10}\.\d{2}$/;
    if (!regex.test(cena)) {
        console.log("regex");
        return res.status(500).json({ error: "Error: cena w złym formacie" });
    }

    if (ilosc < 0) {
        console.log("ilosc");
        return res.status(400).json({ error: "Error ilosc nie moze byc mniejsza od zera" });
    }

    const opcje = ["ogrodowe", "domowe", "akcesoria"];
    if (!opcje.includes(rodzaj)) {
        console.log("ogrody");
        return res.status(404).json({ error: "nie znaleziono takiego rodzaju" });
    }

    console.log("przeszlo");
    req.nazwa = nazwa;
    req.cena = cena;
    req.ilosc = ilosc;
    req.rodzaj = rodzaj;
    next();
};

module.exports={
    checkValidInput,
    checkQuantityOfCartProduct,
    handleUser,
    checkProductQuantity
}