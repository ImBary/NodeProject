const express = require('express');
const app = express();
const api = require('./api/api')
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mw = require('./middleware');
const bcrypt = require('bcrypt');

app.use(cookieParser());
app.use(express.json());


const passport = require('passport');
const initializePassport = require('./config/passport-config');
const { json } = require('body-parser');


initializePassport(
    passport,
    async (username) => await api.getUserIdByUsersName(username),
    async (id) => await api.getUserById(id) 
);

app.use(session({
    secret: 'secret strong key for login',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 
app.use(mw.handleUser);
app.set('view engine','ejs');
app.use(express.urlencoded( {extended: true}));


app.post('/posts', async (req,res)=>{

    const {title, content} = req.body;
    const userName = req.userName;
    try{
        if(userName == "nieznajomy"){
            return res.redirect('/login');
        }
        const userId = await api.getUserIdByUsersName(userName);
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

app.get('/',async (req,res)=>{
    const userName = req.userName 
    try{
        const posts = await api.getPosts();
        const role = await api.getUserRole(userName);
        console.log("role "+role);
        if(role == "admin"){
            const users = await api.getUsers();
            res.render('admin',{posts,userName,users})
        }else{
            console.log(userName);
            res.render('index',{posts,userName});
        }
       
    }catch(err){
        console.error(err);
        res.status(500).send('Błąd serwera DUPA');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') });
});

app.get('/register',(req,res)=>{
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, code } = req.body;

    try {
        const isInBase = await api.getUserIdByUsersName(username);

        if (isInBase.length > 0) {
            req.flash('error', 'Username already exists');
            return res.redirect('/login');
        } else {
            const saltRounds = 10; 
            const hashedCode = await bcrypt.hash(code, saltRounds);

            const newUser = { name: username, code: hashedCode };
            await api.createUsers(newUser);
            req.session.user = username;
            res.cookie('username', username, { maxAge: 9999, httpOnly: true });
            res.redirect('/');
        }
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Failed to register user');
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            console.log("Authenticated user object:", user); 
            req.session.user = user.name; 
            res.cookie('username', user.name, { maxAge: 900000, httpOnly: true });
            return res.redirect('/');
        });
    })(req, res, next);
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Błąd podczas niszczenia sesji', err);
            return res.status(500).send('Nie udało się wylogować');
        }
        res.clearCookie('username'); 
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.delete('/comments/:id', async (req, res) => {
    const commentId = req.params.id;

    try {
        await api.deleteCommentById(commentId);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.sendStatus(500);
    }
});


app.get('/posts/:id', async (req,res)=>{
    const postId = req.params.id;
    const usrName = req.userName;
    try{
        const user = await api.getUserIdByUsersName(usrName);
        const dbPost = await api.getPostById(postId);
        const dbComments = await api.getCommentsByPostId(postId);
        if(!dbPost || dbPost===1){
            return res.redirect('/')
        }
        const post = dbPost[0];
        if(usrName!=='nieznajomy'){
            let loggedInUserId = user[0].id;
            const userRole = await api.getUserRole(usrName);
            console.log(JSON.stringify(dbComments));
            res.render('post',{post:post,dbComments,loggedInUserId,userRole});
        }else if (usrName==='nieznajomy'){
            let loggedInUserId = 0;
            const userRole = "user"
            console.log(JSON.stringify(dbComments));
            res.render('post',{post:post,dbComments,loggedInUserId,userRole});
        }
        
    }catch(err){
        throw new Error(err);
    }
    
})

app.post('/post/:id', async (req, res) => {
    const postId = req.params.id;
    
    const { comment } = req.body;
    const usrName = req.userName;
    if (usrName == "nieznajomy") {
        console.log("NAAME:" + usrName)
        res.status(303).json({ redirect: '/' });
        return;
    }else{
        
        const user = await api.getUserIdByUsersName(usrName);
        try {
            if (usrName !== 'nieznajomy' && comment != null && comment.length >= 1) {
                const com = { UserId: user[0].id, comment: comment, PostId: postId, userName: usrName };
                await api.createCommentToPost(com);
            }
            console.log("tutaj")

            res.sendStatus(200); 
        } catch (error) {
            console.error("Error creating comment:", error);
            res.sendStatus(500); 
        }
    }
    
});

app.delete('/posts/:id', async (req, res) => {
    const postId = req.params.id;
    const usrName = req.userName;
    if(usrName == "nieznajomy"){
        res.redirect('/login');
    }else{
        const postToDelete = await api.getPostById(postId);
        const user = await api.getUserIdByUsersName(usrName);
        const role = await api.getUserRole(usrName);
   
        try {

            if((user[0].id===postToDelete[0].userId && role == "user") || role === "admin"){
                    const isDeleted = await api.deletePostById(postId);
                if (isDeleted) {
                    console.log("bylem tu")
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

app.put('/post/:id',async (req,res)=>{
    const postId = req.params.id;
    console.log("update post ID: "+postId);
    const { content,title} = req.body;
    
    const userName = req.userName;
    if (userName == "nieznajomy") {
        console.log("NAAME:" + userName)
        res.status(303).json({ redirect: '/login' });
        return;
    }else{
        const postToUpdate = await api.getPostById(postId);
        const userFromDb = await api.getUserIdByUsersName(userName); 
        
        try {
    
            if(userFromDb[0].id===postToUpdate[0].userId){
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
app.get('/admin/user/:id', async (req, res) => {
    const userName = req.userName;
    const userId = req.params.id;

    const role = await api.getUserRole(userName);
    if (role === "admin") {
    
        const userDb = await api.getUserById(userId);
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

app.delete('/admin/user/:id',async(req,res)=>{
    const userName = req.userName;
    const userId = req.params.id;
    const role = await api.getUserRole(userName);

    if(role === "admin"){
        if(await api.deleteUserById(userId)==true){
            res.redirect("/");
        }else{
            res.json({message:"Error finding the user"})
        }
    }else{
        res.json({message:"Only admins can delete users"})
    }

})
app.post('/admin/user/:id', async(req,res)=>{{
    const userName = req.userName;
    console.log("userName zmiana roli:"+userName)
    const userId = req.params.id;
    const role = await api.getUserRole(userName);

    const userToChangeDb = await api.getUserById(userId);
    const userToChange = userToChangeDb[0].role;
    console.log("zmiana roli rolaa:"+role)
    if(role === "admin"){
        if(await api.changeUserRole(userId,userToChange)==true){
            console.log("tutaj")
            
        }else{
            res.json({message:"error changing role"})
        }
    }else{
        res.json({message:"Only admins can change roles"})
    }
    
}})
//endpoint do testu zeby dac komus admina 
app.post('/admin/change/:id',async(req,res)=>{
    const role = await api.getUserRole("admin");
    await api.changeUserRole("admin");
    res.send(200);
})

app.listen(3000,()=>{console.log("server on 3000");});