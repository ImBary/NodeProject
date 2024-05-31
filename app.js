const express = require('express');
const app = express();
const api = require('./api');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

app.use(cookieParser());
app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secret: false }
}));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

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
    let userName = 'Nieznajomy'; // Domyślna wartość, jeśli nie ma sesji ani ciasteczka
    if (req.session.user) {
        userName = req.session.user; // Użyj nazwy z sesji, jeśli dostępna
    } else if (req.cookies.username) {
        userName = req.cookies.username; // Użyj nazwy z ciasteczka, jeśli sesja nie istnieje
        req.session.user = userName; // Odtwórz sesję z ciasteczka
    }
    try {
        const products = await api.getProducts(); // Pobieranie użytkowników z bazy danych
        console.log("app: "+JSON.stringify(products));
        res.render('home', { products, userName }); // Przekazanie użytkowników i nazwy użytkownika do szablonu
    } catch (error) {
        console.error(error);
        res.status(500).send('Błąd serwera');
    }
});

app.listen(3000, () => console.log('Server running on port 3000 '));
