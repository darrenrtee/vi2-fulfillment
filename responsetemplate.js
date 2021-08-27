const mongoose = require('mongoose')
const Schema = mongoose.Schema

const responseTemplateSchema = new Schema({
    _id:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true  
    },
    response:{
        type: String,
        required: true  
    }
})

module.exports = mongoose.model('responsetemplates',responseTemplateSchema)