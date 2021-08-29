const mongoose = require('mongoose')
const Schema = mongoose.Schema

const questionTemplateSchema = new Schema({
    _id:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true  
    },
    question:{
        type: String,
        required: true  
    },
    answer:[{
        type: String,
        required: true  
    }],
    restatement:{
        type: String,
        required: true  
    },
    uielement:{
        type: String,
        required: true  
    }
})

module.exports = mongoose.model('questiontemplates',questionTemplateSchema)