const knex = require('knex')(require('../knexfile').development);

// POSTS


const createPost = async (post) => {
    try{
        return await knex('posts').insert(post);
    }catch(error){
        console.error('Error creating Post', error);
        throw error;
    }
    
};

const getPosts = async () => {
    try{
        return await knex('posts').select('*');
    }catch(error){
        console.error('Error geting Posts', error);
        throw error;
    }
    
};

const getPostsByUserId = (userId) =>{
    
    
    try {
        return knex('posts').select().where('userId',userId); 
    } catch (error) {
        console.error('Error getting Post by user id', error);
        throw error; 
    }
};

const getPostById = async (id)=>{

    try {
        const post = await knex('posts').select().where('id',id);
        return post ? post : -1 ;
    } catch (error) {
        console.error('Error getting post by its id', error);
        throw error; 
    }

}



const deletePostById = async (id)=>{
    try{
        const isHere = await knex('posts').select().where('id',id);
        if(isHere){
            await knex('posts').delete().where('id',id);
            await knex('comments').delete().where('PostId',id);
                //console.log("deleted:" + isHere[0])
            return isHere;
        }else{
            console.log("no post with this id")
            return false;
        }
    }catch(error){
        console.error('Error deleting post by its id', error);
        throw error; 
    }
    
}

const updatePostByUserId = async(id,content,title) =>{
    try{
        const isHere = await knex('posts').select().where('id',id);
        if(isHere){
            await knex('posts').where('id',id).update('content',content);
            await knex('posts').where('id',id).update('title',title);
            console.log("im here "+ isHere);
            return isHere;
        }else{
            console.log('no post with this id');
            return false;
        }
    }catch(error){
        console.error('Error updating post by user id', error);
        throw error; 
    }
    


}

// USERS

const createUsers = async (user) => {
    console.log(user);
    try{
        return await knex('users').insert(user);
    }catch(error){
        console.error('Error creating user', error);
        throw error;
    }
    
};

const getUserRole = async (userName) => {
    if(userName && userName != 'nieznajomy'){
        try {
            const result = await knex('users').select('role').where('name', userName);
            console.log(JSON.stringify(result))
            
            const roleName = result[0].role;
            console.log(roleName);
            
            return roleName;
        } catch (error) {
            console.error("Error getting user role", error);
            throw error;
        }
    }
    
}

const getUsers = async () => {
    try{
        let users = await knex('users').select();
        let sortedUsers = users.sort((a, b) => {
            let nameA = a.name.toUpperCase(); 
            let nameB = b.name.toUpperCase(); 
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        return sortedUsers;
    }catch(error){
        console.error('Error getting users', error);
        throw error;
    }
    
};

const getUserById = async (id) => {
    
    try{
        return await knex('users').select().where('id', id);
    }catch(error){
        console.error('Error getting user by id', error);
        throw error;
    }
};

const getUserByUsername = async (userName) => {
    try {
        const user = await knex('users').select().where('name', userName);
        return user[0];
    } catch (error) {
        console.error('Error getting user by his name ', error);
        throw error;
    }
}

const getUserIdByUsersName = async (userName) =>{
    
    try {
        const userId = await knex('users').select('id').where('name',userName);
        return userId ? userId : -1;
    } catch (error) {
        console.error('Error getting user id  by username:', error);
        throw error; 
    }
    
}

const changeUserRole = async(userId,role)=>{
    try{
        
        if(role === "admin"){
            await knex('users').where('id',userId).update('role',"user");
            console.log("updated to user id:"+ userId)
            return true;
        }else{
            await knex('users').where('id',userId).update('role','admin');
            console.log("updated to admin")
            return true;
        }
    }catch(error){
        console.error('Error getting user id  by username:', error);
        throw error;
    }
    
}

const getCodeByUserName = async(userName)=>{
    try{
        const userCode =  await knex('users').select('code').where('name',userName);
        return userCode ? userCode : -1;
    }catch(error){
        console.error('Error geting password by username ', error);
        throw error; 
    }
    
}

const deleteUserById = async(userId) =>{
    try{
        const user = await knex('users').select().where('id',userId);
        if(user.length === 0){
            throw new Error("nie ma takiego uzytkownika");
        }else{
            await knex('users').where('id',userId).del();
            return true;
        }

    }catch(error){
        console.error("Error deleting user",error);
        throw error;
    }
}

// COMMENTS


const createCommentToPost = async(comment)=>{
    //console.log("api comment: "+comment);
    try{
        return await knex('comments').insert(comment);
    }catch(error){
        console.error('Error creating comment to post ', error);
        throw error; 
    }
    
}

const getCommentsByPostId = async(postId)=>{
    try{
        return await knex('comments').select().where('PostId',postId);
    }catch(error){
        console.error('Error getting comment by post id ', error);
        throw error; 
    }
    
}

const deleteCommentById = async(commentId)=>{
    try{
        return await knex('comments').delete().where('id',commentId);
    }catch(error){
        console.error('Error deeting comment by id ', error);
        throw error; 
    }
    
}

const updateCommentById=async(id,content)=>{
    try{
        return await knex('comments').where('id',id).update("comment",content);

    }catch(error){
        console.error("Error updating comment",error);
        throw error;
    }
}

const getCommentsByUserId = async(userId)=>{
    try{
        const comments = await knex('comments').select().where('userId',userId);
        return comments;
    }catch(error){
        console.error('Error getting comments by User id ', error);
        throw error; 
    }
}

module.exports = {
    changeUserRole,
    deleteUserById,
    getCommentsByUserId,
    getUserRole,
    getUserByUsername,
    createPost,
    getPosts,
    getUsers,
    createUsers,
    getPostsByUserId,
    getUserById,
    getUserIdByUsersName,
    getPostById,
    deletePostById,
    updatePostByUserId ,
    getCodeByUserName ,
    getCommentsByPostId,
    createCommentToPost,
    deleteCommentById,
    updateCommentById
};