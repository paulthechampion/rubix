const express= require('express');
const app= express();
const Author= require('../model/author');
const Books= require("../model/books")
//all authors route
app.get('/', async (req,res)=>{
    let searchOption= {};
    if(req.query.name !== null && req.query.name !== ''){
        searchOption.name=new RegExp(req.query.name, 'i');
    };
    try{
        const authors= await Author.find(searchOption);
        res.render('authors/index',
        {
        authors:authors,
        searchOption:req.query
        });
    }catch{
        res.redirect('/');
    }
});

// new authors route
app.get('/new',function(req,res){
    res.render('authors/new',{author: new Author()});
});

// create author route
app.post('/', async (req,res)=>{
    const author = new Author({
        name:req.body.name
    });
    
    try {
       const newAuthor= await author.save();  
       res.redirect(`/authors/${newAuthor.id}`)
    } catch { 
        res.render('authors/new', {
                 locals:{errorMessage:"Error creating new Author"},
                 author:author
               });
        }
     });

app.get('/:id', async(req,res)=>{
    try{
        const author= await Author.findById(req.params.id)
        const books = await Books.find({author:author.id}).limit(6).exec()
        res.render('authors/show',{
            author:author,
            booksByAuthor:books
        })
    }catch(err){
        console.log(err)
        res.redirect('/')
    }
})

app.get('/:id/edit', async (req,res)=>{
    
    try{
    const author= await Author.findById(req.params.id)
    res.render('authors/edit', {author:author})
   }catch{
    res.redirect(`/authors`)
   }
    
})

app.put('/:id', async(req,res)=>{
    let author
    try {
        author= await Author.findById(req.params.id)
        author.name=req.body.name
        await author.save();  
       res.redirect(`/authors/${author.id}`)
    } catch { 
        if(author == null){
            res.redirect('/')
        }else{
            res.render('authors/edit', {
                locals:{errorMessage:"Error updating Author"},
                author:author
              });  
        }
        res.render('authors/new', {
                 locals:{errorMessage:"Error creating new Author"},
                 author:author
               });
        }
})

app.delete('/:id', async(req,res)=>{
    let author
    try {
        author= await Author.findById(req.params.id)
        await author.remove();  
       res.redirect('/authors')
    } catch { 
        if(author == null){
            res.redirect('/')
        }else{
            res.redirect(`/authors/${author.id}`) 
        }
        res.render('authors/new', {
                 locals:{errorMessage:"Error creating new Author"},
                 author:author
               });
        }
})
module.exports =app;