const mongoose = require('mongoose')
const Schema = mongoose.Schema

const characterSchema = new Schema({
    _id:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true  
    },
    pronoun:{
        type: String,
        required: true
    },
    possessivepronoun:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    }
    
})

module.exports = mongoose.model('characters',characterSchema)