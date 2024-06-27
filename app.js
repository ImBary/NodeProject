const express = require('express');//glowny framework
const app = express();
const api = require('./api/api');
const flash = require('connect-flash');//middleware pozwalajacy komunikaty flash czyli tymczasowe wiadomosci przechowywane w sesji
const cookieParser = require('cookie-parser');// middleware analizuje naglowek Cookie ii wypełnia req.cookies obiektem, ktorego kluczami sa ciasteczka
const session = require('express-session');// to middleware sesji dla express pozwala na zarzaadzaanie i tworzenie sesji uzytkownikow
const mw = require('./middleware');//moje middleware
const bcrypt = require('bcrypt');//biblioteka pozwalajaca na haszowanie hasel
require('dotenv').config();
app.use(cookieParser());
app.use(express.json());


const passport = require('passport');//middleware uwierzetelniania dla Node.js
const initializePassport = require('./config/passport-config');//sciezka do plku konfig passportu
const { json } = require('body-parser');//middleware sluzy do analiizowania przychodzacych tresci żądań req.body


initializePassport(//ustawia sposób, w jaki Passport będzie weryfikował tożsamość użytkowników
    passport,
    async (username) => await api.getUserIdByUsersName(username),
    async (id) => await api.getUserById(id) 
);

app.use(session({//dodaje middleware sesji do aplikacji, tweorzy unikalne sesje dla uzytkownika
    secret: 'secret strong key for login',//tajny klucz uzywana do podpiswyania ciasteczek sesji
    resave: false,//zzapobiega ponownego zapisaniu sesji jesli nie została zmodyfikowana
    saveUninitialized: false,//zapobiega zapisywaniu nowych, ale nie zmodyfikowanych sesji
    cookie: { secure: false } //ciasteczko moze byc przeslane przez HTTP dla HTTPS: true
}));

app.use(passport.initialize());//inicjalizuje passport w apce
app.use(passport.session());//włacza osbsluge sesji przez passport
app.use(flash()); //dodaje "connect-flash" do aplikacji
app.use(mw.handleUser);//dodaje moj middleware

app.set('view engine','ejs');//ustawia silnik szablonu ejs
app.use(express.urlencoded( {extended: true}));//Dodaje middleware do parsowania danych przesyłanych w formularzach HTML
//extended:true pozwala na parsowanie zlozonych obiektow i tablic danych formularza




//user

app.get('/login', async (req, res) => {// wyswietlenie widoku logowaniaa
    res.render('login', { message: req.flash('error') });
});

app.get('/register',async (req,res)=>{//wyswietlenie widoku rejestracji
    res.render('register');
});

app.post('/register',mw.validatePassword, async (req, res) => {//obsluga rejestracji 
    const username = req.name;
    const code = req.code;

    try {
        const isInBase = await api.getUserIdByUsersName(username);

        
        const saltRounds = 10; //okreslenie ilosc rund haszowania dla bcrypt im wiecej tym lepiej
        const hashedCode = await bcrypt.hash(code, saltRounds);//haszowanie bcrypt

        const newUser = { name: username, code: hashedCode };
        await api.createUsers(newUser);
        req.session.user = username;//ustawia nazwe uzytkownikaa w sesji 
        res.cookie('username', username, { maxAge: 9999, httpOnly: true });//maxAge czas zycia ciasteczka, httpOnly zabezpiecza przed dostepem przez JS w przegladarce
        res.redirect('/');
        
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Failed to register user');
    }
});

app.post('/login', async (req, res, next) => {//obsluga logowania
    passport.authenticate('local', (err, user, info) => {//inicjuje proces uwierzytelniania, strategia 'local' oparta na nazwie uzytkownika i hasle, user to obiekt uzytkownika jesli sie powiodlo, info dodatkowe info o wyniku ale nie uzywane
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');//jak uwierzzytelnianie sie nie powiodlo i user nie bedzie dobrze zwrocony to sprowadz do logowania
        }
        req.logIn(user, (err) => {//loguje uzytkownika, user uwierzytelniony, passport tworzy sesje zapisuje info o userze
            if (err) {
                return next(err);
            }
            //console.log("Authenticated user object:", user); //debug
            req.session.user = user.name; //jak w register
            res.cookie('username', user.name, { maxAge: 900000, httpOnly: true });
            return res.redirect('/');
        });
    })(req, res, next);
});

app.post('/postsort',async(req,res)=>{
    const {typeOfSort,action} = req.body;
    const userName = req.userName;
    const role = await api.getUserRole(userName);
    try{
        if(action==='filtr'){
            const posts = await api.getPosts();
            let sorted ;
            //console.log(typeOfSort)
            const totalLen = posts.reduce((sum,post)=>sum+post.content.length,0)
            const avgLen = posts.length > 0 ? (totalLen/posts.length) : 0;
            if(typeOfSort==='desc'){
                sorted = posts.filter(post => post.content.length >= avgLen);
            }else if(typeOfSort==='asc'){
                sorted = posts.filter(post => post.content.length < avgLen);
    
            }else{
                sorted=posts;
            }
            console.log(sorted)
            if(role === 'admin'){
                const users = await api.getUsers();
                res.render('admin',{posts:sorted,userName,users});
            }else{
                res.render('index',{posts: sorted,userName});
            }
            
        }
    }catch(err){
        res.status(500).json({message:"Error with loading filters"});
    }
    
})


app.get('/logout', async (req, res) => {//wylogowanie  z niszczyniem sesji
    req.session.destroy(err => {//niszczy aktualna sesjse uzytkownika
        if (err) {
            console.error('Błąd podczas niszczenia sesji', err);
            return res.status(500).send('Nie udało się wylogować');
        }
        res.clearCookie('username'); //usuwa ciasteczko username
        res.clearCookie('connect.sid');//usuwa ciasteczko identyfikatora sesji
        res.redirect('/');
    });
});//usuwanie ciasteczek zapobiega wykorzystniu pozostawionych danych przez nieautoryzowane osoby

//posts

app.get('/',async (req,res)=>{//glowna strona domowa
    const userName = req.userName ;
    try{
        const posts = await api.getPosts();
        const role = await api.getUserRole(userName);
        //console.log("role "+role);
        if(role == "admin"){
            const users = await api.getUsers();
            res.render('admin',{posts,userName,users});
        }else{
            console.log(userName);
            res.render('index',{posts,userName});
        }
       
    }catch(err){
        console.error(err);
        res.status(500).send('Błąd serwera ');
    }
});

app.post('/posts', async (req,res)=>{//tworzenie postu

    const {title, content} = req.body;
    const userName = req.userName;
    try{
        if(userName == "nieznajomy"){//tylko zalogowani moga dodac post
            return res.redirect('/login');
        }
        const userId = await api.getUserIdByUsersName(userName);//dodatkowo sprawdzamy czy user jest w bazie
        if(userId.length===0){
            return res.redirect('/login');
        }
        
        const usrPost = {title:title,content:content,userId:userId[0].id};
        await api.createPost(usrPost);
        res.redirect('/');
    }catch(err){
        console.error(err);
        res.status(500).send('Error adding user');
    }
});

app.delete('/comments/:id', async (req, res) => {//usuwanie komentarzy
    const commentId = req.params.id;
    const userName = req.userName;
    const role = await api.getUserIdByUsersName(userName);
    try {
        if(role!=="user" || role!=="admin"){
            res.redirect('/login');
        }
        await api.deleteCommentById(commentId);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.sendStatus(500);
    }
});

app.put('/comments/:id', async (req, res) => {//update komentarzy
    const commentId = req.params.id;
    const newContent = req.body.comment;
    const userName = req.userName;
  
    if(userName=="nieznajomy"){
        res.redirect('/');
    }else{
        try {
            await api.updateCommentById(commentId, newContent);
            res.json({success:true});
        } catch (error) {
            console.error('Error updating comment:', error);
            res.sendStatus(500); 
        }
    }
    
});

app.get('/post/:id', async (req,res)=>{//wyswietlenie konkternego posta
    const postId = req.params.id;
    const usrName = req.userName;
    console.log(postId);
    try{
        const user = await api.getUserIdByUsersName(usrName);
        const dbPost = await api.getPostById(postId);
        const dbComments = await api.getCommentsByPostId(postId);
        console.log(JSON.stringify(dbPost));
        if(!dbPost || dbPost.length==0){
            return res.status(404).json({message:"error finding page"});
        }
        const post = dbPost[0];
        if(usrName!=='nieznajomy'){
            let loggedInUserId = user[0].id;
            const userRole = await api.getUserRole(usrName);
            console.log(JSON.stringify(dbComments));
            res.render('post',{post:post,dbComments,loggedInUserId,userRole});//przekazujemy dane dla ejs 
        }else if (usrName==='nieznajomy'){
            res.redirect('/login');
        }
        
    }catch(err){
        
        console.error(err);
        res.status(500).json({message:"Error deleting post"});
    }
    
})

app.post('/post/:id', async (req, res) => {//stworzenie comentu
    const postId = req.params.id;
    
    const { comment } = req.body;
    const usrName = req.userName;
    if (usrName == "nieznajomy") {
        //console.log("NAAME:" + usrName)
        res.redirect('/login');
        
    }else{
        
        const user = await api.getUserIdByUsersName(usrName);
        try {
            if (usrName !== 'nieznajomy' && comment != null && comment.length >= 1) {
                const com = { UserId: user[0].id, comment: comment, PostId: postId, userName: usrName };
                await api.createCommentToPost(com);
            }
            //console.log("tutaj")

            res.sendStatus(204); 
        } catch (error) {
            console.error("Error creating comment:", error);
            res.sendStatus(500); 
        }
    }
    
});

app.delete('/posts/:id', async (req, res) => {//usuwanie posta, kaskadowo usunie komentarze bo tak jest w modelu
    const postId = req.params.id;
    const usrName = req.userName;
    if(usrName == "nieznajomy"){
        res.redirect('/login');
    }else{
        const postToDelete = await api.getPostById(postId);
        const user = await api.getUserIdByUsersName(usrName);
        const role = await api.getUserRole(usrName);
   
        try {

            if((user[0].id===postToDelete[0].userId && role == "user") || role === "admin"){//admin moze mimo ze nie jego post 
                    const isDeleted = await api.deletePostById(postId);
                if (isDeleted) {
                    //console.log("bylem tu")
                    res.redirect('/');
                } else {
                    res.status(500).send("Failed to delete post");
                }
            }else{
                res.redirect('/');
                
            }
            
            
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting post");
        }
    }
});

app.put('/post/:id',async (req,res)=>{//update posta
    const postId = req.params.id;
    //console.log("update post ID: "+postId);
    const { content,title} = req.body;
    
    const userName = req.userName;
    if (userName == "nieznajomy") {
       // console.log("NAAME:" + userName)
        res.redirect('/login');
        
    }else{
        const postToUpdate = await api.getPostById(postId);
        const userFromDb = await api.getUserIdByUsersName(userName); 
        const role = await api.getUserRole(userName);
        try {
    
            if((userFromDb[0].id===postToUpdate[0].userId) || role ==="admin"){//admin tez moze
                const isUpdated = await api.updatePostByUserId(postId,content,title);
                if(isUpdated){
                    res.redirect('/');
                }else{
                    res.status(500).send('udpating error');
                }
    
            }else{
                res.redirect('/');
            }
            
            
        } catch (err) {
            console.error(err);
            res.status(500).send("Error deleting post");
        }
    }
    
})
//admin
app.get('/admin/user/:id', async (req, res) => {//wyswietlenie danego uzytkownika
    const userName = req.userName;
    const userId = req.params.id;

    const role = await api.getUserRole(userName);
    if (role === "admin") {//tylko admini
    
        const userDb = await api.getUserById(userId);
        if(!userDb || userDb.length<1){
            res.status(404).json({message:'Error finding user'})
        }
        const user = userDb[0];
        const posts = await api.getPostsByUserId(userId);
        const countOfPosts = posts.length;
        const comments = await api.getCommentsByUserId(userId);
        const countOfComments = comments.length;
  
        res.render("user", { user, posts, countOfPosts, comments , countOfComments});
    } else {
        
        res.json({ message: "Only admins can view users", role });
    }
});

app.delete('/admin/user/:id',async(req,res)=>{//usuwanie uzytkownikow
    const userName = req.userName;
    const userId = req.params.id;
    const role = await api.getUserRole(userName);
    const userToDelete = await api.getUserById(userId);

    if((role === "admin") && ( userName != userToDelete[0].name)){//samego siebie nie mozna usunac
        if(await api.deleteUserById(userId)==true){
            res.redirect("/");
        }else{
            res.json({message:"Error finding the user"});
        }
    }else{
        res.json({message:"Only admins can delete users"});
    }

})
app.post('/admin/user/:id', async(req,res)=>{//zmiana roli
    const userName = req.userName;
    //console.log("userName zmiana roli:"+userName)
    const userId = req.params.id;
    const role = await api.getUserRole(userName);

    const userToChangeDb = await api.getUserById(userId);
    const userToChange = userToChangeDb[0].role;
    //console.log("zmiana roli rolaa:"+role)
    if((role === "admin") && (userName != userToChangeDb[0].name)){//samemu sobie nie zmienimy
        if(await api.changeUserRole(userId,userToChange)==true){
            //console.log("tutaj");
            
        }else{
            res.json({message:"error changing role"})
        }
    }else{
        res.json({message:"Only admins can change roles"})
    }
    
})


app.listen(process.env.PORT, process.env.HOST_Wifi, () => {
    console.log(`Server is running at http://${process.env.HOST_Wifi}:${process.env.PORT}/`);
  });