const knex = require('knex')(require('../config/knexfile').development);

// POSTS


const createPost = (post) => {
    try{
        return knex('posts').insert(post);
    }catch(error){
        console.error('Error creating Post', error);
        throw error;
    }
    
};

const getPosts = () => {
    try{
        return knex('posts').select('*');
    }catch(error){
        console.error('Error geting Posts', error);
        throw error;
    }
    
};

const getPostByUserId = (userId) =>{
    
    
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

const createUsers = (user) => {
    console.log(user);
    try{
        return knex('users').insert(user);
    }catch(error){
        console.error('Error creating user', error);
        throw error;
    }
    
};

const getUsers = () => {
    try{
        return knex('users').select();
    }catch(error){
        console.error('Error getting users', error);
        throw error;
    }
    
};

const getUserById = (id) => {
    
    try{
        return knex('users').select().where('id', id);
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

const getCodeByUserName = async(userName)=>{
    try{
        const userCode =  await knex('users').select('code').where('name',userName);
        return userCode ? userCode : -1;
    }catch(error){
        console.error('Error geting password by username ', error);
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


module.exports = {
    getUserByUsername,
    createPost,
    getPosts,
    getUsers,
    createUsers,
    getPostByUserId,
    getUserById,
    getUserIdByUsersName,
    getPostById,
    deletePostById,
    updatePostByUserId ,
    getCodeByUserName ,
    getCommentsByPostId,
    createCommentToPost,
    deleteCommentById
};