const express= require('express');
const app= express();
const Book= require('../model/books');
const Author= require('../model/author');
const { Buffer } = require('buffer');
const imageMimeTypes= ['image/jpeg','image/png','image/gif'];
const pdfMimeType = 'application/pdf'

//all Books route
app.get('/', async (req,res)=>{
  let query= Book.find()
  if(req.query.title != null && req.query.title != ''){
    query= query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
    query= query.lte('publishDate', req.query.publishedBefore)
  }
  if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
    query= query.gte('publishDate', req.query.publishedAfter)
  }

  try{
    const books= await query.exec()
    res.render('books/index',{
      books:books,
      searchOption: req.query
    });

  }
  
  catch{
    res.redirect('/')
  }
  
  
  
});

// new Books route
app.get('/new',async(req,res)=>{
  renderNewPage(res,new Book())
    
});

// create Books route
app.post('/', async (req,res)=>{
   // const fileName = req.file != null ? req.file.filename : null; 
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      publishDate: new Date(req.body.publishDate),
      pageCount: req.body.pageCount,
      description: req.body.description,
    })
    saveCover(book, req.body.cover)
    savePdf(book, req.body.pdf)

    try{
      const newBook = await book.save();
      res.redirect(`books/${newBook.id}`)
      
    }catch{
      renderNewPage(res,book, true)
    }
     });

//get one book route
app.get('/:id', async(req,res)=>{
    try{
      const book = await Book.findById(req.params.id).populate('author').exec()
      res.render('books/show',{book:book})

    }catch{
      res.redirect('/')
    }
})

//edit book rote
app.get('/:id/edit', async(req,res)=>{
    try{
      const book= await Book.findById(req.params.id)
      renderEditPage(res,book)
    }catch{
      res.redirect('/')
    }
})
  
  
//read book rote
app.get('/:id/read', async(req,res)=>{
  try{
    const book= await Book.findById(req.params.id)
    res.render('books/read',{book:book})
  }catch{
    res.redirect('/')
  }
})

// Update Book Route
  app.put('/:id', async (req,res)=>{
  let book
  
    try{
      book = await Book.findById(req.params.id)
      book.title=req.body.title
      book.author= req.body.author
      book.publishDate= new Date(req.body.publishDate)
      book.pageCount= req.body.pageCount
      book.description= req.body.description

      if(req.body.cover !=null && req.body.cover != ''){
        saveCover(book, req.body.cover)
      }
      await book.save()
      res.redirect(`/books/${book.id}`)
      }
    catch{
      if (book != null){
        renderEditPage(res,book,true)
      }else{
        redirect('/')
      }
    }
      })

app.delete('/:id', async(req,res)=>{
  let book
  try{
    book= await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  }catch{
    if(book != null){
      res.render('books/show',{
        book:book,
        errorMessage:'Could not remove book'
      })
    }else{
      res.redirect('/')
    }
  }
})



async function renderEditPage(res, book,form, hasError= false){
  renderFormPage(res,book,'edit',hasError)
}

async function renderFormPage(res, book,form, hasError= false){
  try{
    const authors= await Author.find({});
    
    const params={
      authors:authors,
      book:book
  }
  if(hasError){
    if(form==='edit'){
      params.errorMessage='Error Updating Book'
    }else {
      params.errorMessage='Error Creating Book'
    }
  }
  res.render(`books/${form}`,params); 
  }catch{
    res.redirect('/books/new');
  }
};

async function renderNewPage(res, book, hasError= false){
  renderFormPage(res,book,'new',hasError)
  };

  function saveCover(book, coverEncoded){
    if(coverEncoded== null) return
    const cover= JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
      book.coverImage = new Buffer.from(cover.data, 'base64')
      book.coverImageType= cover.type
    }
  }

  function savePdf(book, pdfEncoded){
    if(pdfEncoded== null) return
    const pdf= JSON.parse(pdfEncoded)
    if(pdf != null && pdfMimeType.includes(pdf.type)){
      book.pdf = new Buffer.from(pdf.data, 'base64')
      book.pdfType= pdf.type
    }
  }


module.exports =app;