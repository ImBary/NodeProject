const express = require('express');
const app = express();
const api = require('./api');
const mw = require('./middlewares');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secret: false }
}));

app.set('view engine', 'ejs');

app.use(mw.handleUser);


app.use(express.urlencoded({ extended: true }));

app.get('/admin',async (req,res)=>{
    userName= req.userName;
    const products = await api.getProducts(); // Pobieranie użytkowników z bazy danych
    console.log("app: "+JSON.stringify(products));
    res.render('admin', { products, userName });
})

app.post('/admin',mw.checkValidInput,async(req,res)=>{
    console.log("jestem")
    if(req.userName==='Admin'){
        const prod = {
            nazwa:req.nazwa,
            cena:req.cena,
            ilosc:req.ilosc,
            rodzaj:req.rodzaj
        }
        await api.createProduct(prod);
        console.log("Produkt Dodany")
        res.sendStatus(200);
    }
})

app.delete('/admin/:id',mw.checkValidDel,async (req,res)=>{
    console.log('tutaj del')
    if(req.userName==='Admin'){
        const id = req.id;
        await api.deleteProductById(id);
        console.log("admin del")
        res.sendStatus(200);
    }
    
})
app.put('/admin/:id',mw.checkValidInput,async (req,res)=>{
    console.log('tutaj')
    if(req.userName==='Admin'){
        const id = req.params.id;
        const prod = {
            nazwa:req.nazwa,
            cena:req.cena,
            ilosc:req.ilosc,
            rodzaj:req.rodzaj
        }
        await api.updateProduct(id,prod);
        console.log("admin")
        res.sendStatus(200);
    }
    
})

app.get('/login', (req, res) => {
    res.render('login');  // Wyświetl formularz logowania
});

app.post('/login', (req, res) => {
    const { username } = req.body;
    req.session.user = username; // Przechowaj nazwę użytkownika w sesji
    res.cookie('username', username, { maxAge: 900000, httpOnly: true }); // Ustaw ciasteczko
    res.redirect('/');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Błąd podczas niszczenia sesji', err);
            return res.status(500).send('Nie udało się wylogować');
        }
        res.clearCookie('username'); // Usuń ciasteczko z nazwą użytkownika
        res.clearCookie('connect.sid'); // Usuń ciasteczko sesji
        res.redirect('/');
    });
});


app.get('/', async (req, res) => {
    const userName = req.userName
    try {
        const products = await api.getProducts(); // Pobieranie użytkowników z bazy danych
        console.log("app: "+JSON.stringify(products));
        res.render('home', { products, userName }); // Przekazanie użytkowników i nazwy użytkownika do szablonu
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }
});

app.get('/products/:id',async(req,res)=>{
    const productId = req.params.id;
    const usrName = req.userName;
    try{
        const prod = await api.getProductById(productId);
        const opinions = await api.getOpinionsByProductId(productId);
        res.render('product',{product:prod[0],opinions})

    }catch(err){
        throw new Error(err);
    }
})

app.put('/products/:id', mw.checkProductQuantity, async (req, res) => {
    
    const userName = req.userName;

    try {
        if (userName === 'Nieznajomy') {
            res.redirect('/');
        } else {
            const userId = await api.getUserIdByUserName(userName);
            console.log(JSON.stringify(userId));
            console.log(userId[0].id);
            const prod = req.product; //produkt z middleweare
            const ilosc = req.ilosc;
            const prodId=req.prodId;
            console.log("ilosc: "+ilosc)
            console.log("prod z mw: "+JSON.stringify(prod));
            const cartProd = { nazwa: prod.nazwa, cena: prod.cena, ilosc: ilosc, userId: userId[0].id, productId: prodId };
            console.log("cart Prod: "+cartProd)
            if ((await api.getProdFromCartByProdId(prodId)).length>0) {
                // juz jest w koszyku
                const iloscKoszyka = req.ilosc
                await api.updateCountOfProductsInCart(prodId, iloscKoszyka);
                console.log("zmiena ilosci");
                
            } else {
                await api.addProductToCart(cartProd);
                console.log("Koszyk dodano: " + JSON.stringify(cartProd));
                
            }
        }
    } catch (err) {
        console.error("Error: ", err);
        res.status(500).send("ERROR");
    }
});


app.get('/cart',async (req,res)=>{
    const userName = req.userName;
    if(userName!=='Nieznajomy'){
        const userId = await api.getUserIdByUserName(userName);
        const id = userId[0].id;
        const cart = await api.getProdFromCartByUserId(id);
        const sumPrice = cart.reduce((sum,prod)=> sum + (prod.cena * prod.ilosc),0);
        res.render('cart',{cart,sumPrice})
    }else{
        res.redirect('/login');
    }

})

app.put('/cart/:id',mw.checkQuantityOfCartProduct,async (req,res)=>{
    const userName = req.userName;
    if(userName!=='Nieznajomy'){
        const ilosc = req.newValue;
        const prodId = req.prodId;
        await api.updateCountOfProductsInCart(prodId,ilosc);
        console.log("zmieniona wartosc w koszyku, id:"+prodId +" ilosc: "+ilosc)
        const product = await api.getProductById(prodId)
        const prod = product[0]
        const newAdd = req.newAdd+prod.ilosc
        console.log("new value "+newAdd)
        await api.updateCountOfProducts(prodId,newAdd);
    }
})

app.listen(3000, () => console.log('Server running on port 3000 '));
