const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commonSenseOntologySchema = new Schema({
    _id:{
        type: String,
        required: true
    },
    first:{
        type: String,
        required: true  
    },
    relation:{
        type: String,
        required: true  
    },
    second:{
        type: String,
        required: true  
    }
})

module.exports = mongoose.model('commonsenseontologies',commonSenseOntologySchema)