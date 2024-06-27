Blog

opis strony:
    strona przedstawia "blog" gdzie zalogowani użytkownicy mogą dodawać swoje posty które zalogowani użytkownicy mogą komentować

TABELE 
    1) users - id, name, code,role
    2) posts - id, title, content, userId
    3) comments - id, userName, comment, userId, postId

role: admin/user - gdzie user to domyślna wartość kazdego nowego rejestrowanego uzytkownika, admin wprowadzony z seeda bezposrednio, login admin, haslo: admin123

users/id jest forgein key dla posts i comments

user 1:n comments
user 1:n posts
posts 1:n comments

SZABLONY

Login - szablon logowania
    1) wpisywanie loginu i hasla(code)
    2) sprawdzanie czy user istnieje jak nie to przenies do register
    3) sprawdzenie poprawnosci hasla usera 

Register - szablon rejestracji 
    1) wpisywanie loginu i hasla
    2) sprawdzanie czy istnieje juz taka nazwa uzytkownika jak tak to przenies do login
    3) sprawdzenie czy haslo jest zgodne z wymaganiami
            * haslo nie moze byc takie samo jak nazwa
            * haslo nie moze byc krotsze niz 5 znakow
            *login i haslo nie mogą być spacja
    4) hasla szyfrowane bcryptem

Post - szablon indywnidualnego postu
    1) wyswietlenie tylulu i kontentu posta
    2) wyswietlenie komentarzy z nazwa autora komentarza
    3) mozliwosc dodanie komentarza jesli user jest zalogowany
    4) mozliwosc edycji posta jesli user jest twórcą posta
    5) mozliwosc filtracji komentarzy zeby wyswietlic swoje komentarze
    6) mozliwosc edycji komentarza

Index - szablon strony glownej
    1) wyswietlenie wszystkich postow
    2) mozliwosc dodania posta jesli user jest zalogowany
    3) mozliwosc przejscia do szablonu logowania
    4) sortowanie wedlug wielkosci contentu postu

Admin - szablon strony glownej ze strony admina
    1) wyswietlenie wszystkich postow
    2) wyswietlenie wszystkich uzytkownikow
    3) mozliwosc tworzenia postow
    4)sortowanie wedlug wielkosci contentu postu

User - szablon indywidualnego usera
    1) nazwa i rola uzytkownika
    2) wszystkie posty danego uzytkownika
    3) wszystkie komentarze uzytkownika
    4) usuniecie uzytkownika
    5) zmiana roli user/admin\


config - folder z plikami validacji logowania
views - szablony strony
.env - plik configuracyjny z danymi odnosnie połączenia z baza i portem

api.js - operacje na bazie danych
middleware.js - validacja logowania i validacja czy user jest zalogowany

app.js - endpointy applikacji

__tests__ - testy dla funkcji api:
    //users
    1) getUserById
    2) createUsers
    3) deleteUser
    //posts
    1) deletePostById
    2) createPost
    3) updatePostByUserId
    4) getPostByUserId
    //comments
    1) createCommentToPost
    2) deleteCommentById
    3) getCommentsByPostId

    app.use(express.static(path.join(__dirname, 'public')));
    const apiPath = path.join(__dirname, 'api', 'api');
    const api = require(apiPath);