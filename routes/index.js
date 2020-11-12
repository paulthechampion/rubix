const express= require('express');
const app= express();
const Book = require('../model/books')

app.get('/', async function(req,res){
let books
try{
    books=await  Book.find().sort({createdAt:'desc'}).limit(10).exec()
   
}catch{
books=[]
}
 res.render('index',{books:books});

});

module.exports =app;