const knex = require('knex')(require('./knexfile').development);

const getUsers = () => {
    return knex('users').select();
};

const getProducts = async () =>{
    const prod =  await knex('products').select();
    console.log("api: "+JSON.stringify(prod));
    return prod;
}

module.exports = {
    getProducts,
    getUsers
    
};