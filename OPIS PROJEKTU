Blog

opis strony:
    strona przedstawia "blog" gdzie zalogowani użytkownicy mogą dodawać swoje posty które zalogowani użytkownicy mogą komentować

TABELE 
    1) users - id, name, code
    2) posts - id, title, content, userId
    3) comments - id, userName, comment, userId, postId

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
    4) hasla szyfrowane bcryptem

Post - szablon indywnidualnego postu
    1) wyswietlenie tylulu i kontentu posta
    2) wyswietlenie komentarzy z nazwa autora komentarza
    3) mozliwosc dodanie komentarza jesli user jest zalogowany
    4) mozliwosc edycji posta jesli user jest twórcą posta
    5) mozliwosc filtracji komentarzy zeby wyswietlic swoje komentarze

Index - szablon strony glownej
    1) wyswietlenie wszystkich postow
    2) mozliwosc dodania posta jesli user jest zalogowany
    3) mozliwosc przejscia do szablonu logowania

config - folder z plikami configuracyjnymi z baza danych i validacji logowania
views - szablony strony
.env - plik configuracyjny z danymi odnosnie połączenia z baza

api.js - operacje na bazie danych
middleware.js - validacja logowania i validacja czy user jest zalogowany

app.js - routes dla aplikacji

__tests__ - testy dla funkcji api:
    //users
    1) getUserById
    2) createUsers
    //posts
    1) deletePostById
    2) createPost
    3) updatePostByUserId
    4) getPostByUserId
    //comments
    1) createCommentToPost
    2) deleteCommentById
    3) getCommentsByPostId