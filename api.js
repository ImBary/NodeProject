const knex = require('knex')(require('./knexfile').development);

const getUsers = () => {
    return knex('users').select();
};

const getProducts = async () =>{
    const prod =  await knex('products').select();
    console.log("api: "+JSON.stringify(prod));
    return prod;
}

const getUserIdByUserName = async(userName) =>{
    const id = await knex('users').select('id').where('login',userName);
    console.log("api: "+ JSON.stringify(id));
    return id;
}

const getProductById = async(id) =>{
    console.log("api id: "+id);
    const prod = await knex('products').select().where('id',id);
    console.log("api prod: "+JSON.stringify(prod));
    return prod;
}

const getOpinionsByProductId = async(productId) =>{
    const opinions = await knex('opinions').select('tresc','rodzaj').where('productId',productId)
    console.log("api opininons: "+JSON.stringify(opinions));
    return opinions;
}

const addProductToCart = async(prod)=>{
    console.log("api dodaje produkt"+ prod);
    return await knex('cart').insert(prod);
    
        
}
const getProdFromCartByUserId = async(userId)=>{
    return await knex('cart').select().where('userId',userId);
 
 }

const getProdFromCartByProdId = async(prodId)=>{
   return await knex('cart').select().where('productId',prodId);
}

const updateCountOfProductsInCart = async(prodId,newValue)=>{
   
    return await knex('cart').where('productId',prodId).update('ilosc',newValue);
    
}

const updateCountOfProducts = async (prodId,newValue)=>{
    try{
        return await knex('products').where('id',prodId).update('ilosc',newValue);
    }catch(err){
        return new Error(err);
    }
}

const updateProduct = async(prodId,newProduct)=>{
   
    return await knex('products').where('id',prodId).update(newProduct);
    
}

const deleteFromCart = async (prodId)=>{
    try{
        return await knex('cart').delete().where('id',prodId);
    }catch(err){
        return new Error(err);
    }
}

const createProduct = async(product)=>{
    return await knex('products').insert(product);
}
const deleteProductById = async(prodId)=>{
    return await knex('products').delete().where('id',prodId)
}

module.exports = {
    deleteProductById,
    createProduct,
    updateProduct,
    deleteFromCart,
    getProdFromCartByUserId ,
    updateCountOfProducts,
    updateCountOfProductsInCart,
    getProdFromCartByProdId,
    addProductToCart,
    getOpinionsByProductId,
    getProductById,
    getUserIdByUserName,
    getProducts,
    getUsers
    
};