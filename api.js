const knex = require('knex')(require('./config/knexfile').development);

const createPost = (post) => {
    return knex('posts').insert(post);
};

const getPosts = () => {
    return knex('posts').select('*');
};

const createUsers = (user) => {
    console.log(user);
    return knex('users').insert(user);
};

const getUsers = () => {
    return knex('users').select();
};

const getUserById = (id) => {
    return knex('users').select().where('id', id);
};

const getUserByUsername = async (userName) => {
    try {
        const user = await knex('users').select().where('name', userName);
        return user[0]; // Assuming you expect to find only one user with this username
    } catch (error) {
        console.error('Error fetching user by username:', error);
        throw error; // Rethrow the error to be handled elsewhere
    }
}

const getPostByUserId = (userId) =>{
    return knex('posts').select().where('userId',userId);
};


const getUserIdByUsersName = async (userName) =>{
    const userId = await knex('users').select('id').where('name',userName);
    //console.log("api user id: " +userId[0]);
    return userId ? userId : -1;
}


const getPostById = async (id)=>{

    const post = await knex('posts').select().where('id',id);
    console.log(post[0]);
    return post ? post : -1 ;

}

const deletePostById = async (id)=>{
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
}

const updatePostByUserId = async(id,content,title) =>{
    const isHere = await knex('posts').select().where('id',id);
    console.log('udpating');
    if(isHere){
        await knex('posts').where('id',id).update('content',content);
        await knex('posts').where('id',id).update('title',title);
        await console.log("im here "+ isHere);
        return isHere;
    }else{
        console.log('no post with this id');
        return false;
    }


}

const createCommentToPost = async(comment)=>{
    //console.log("api comment: "+comment);
    return await knex('comments').insert(comment);
}


const getCommentsByPostId = async(postId)=>{
    return await knex('comments').select().where('PostId',postId);
}




const getCodeByUserName = async(userName)=>{
    const userCode =  await knex('users').select('code').where('name',userName);
    return userCode ? userCode : -1;
}

const deleteCommentById = async(commentId)=>{
    return await knex('comments').delete().where('id',commentId);
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