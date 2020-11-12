const { Buffer } = require('buffer');
const mongoose = require('mongoose');


const bookSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{ 
        type: String,
    },
    publishDate:{
        type: Date,
        required: true
    },
    pageCount:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now,

    },
    coverImage:{
        type: Buffer,
        required: true
    },
    coverImageType:{
        type: String,
        required: true
    },
    pdf:{
        type:Buffer,
        required:true
    },
    pdfType:{
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Authorsss',
        required: true,
        

    },
});

bookSchema.virtual('coverImagePath').get(function(){
    if(this.coverImage != null && this.coverImageType != null){
        return `data:${this.coverImageType}; charset=utf-8; base64,
         ${this.coverImage.toString('base64')}`
    }
})

bookSchema.virtual('pdfPath').get(function(){
    if(this.pdf != null && this.pdfType != null){
        return `data:${this.pdfType};charset=utf-8; base64,${this.pdf.toString('base64')}`
    }
})
module.exports= mongoose.model('Books', bookSchema);
