const mongoose = require('mongoose')
const Schema = mongoose.Schema

const problemTemplateSchema = new Schema({
    _id:{
        type: String,
        required: true
    },
    problem:{
        type: String,
        required: true  
    },
    number:{
        type: String,
        required: true
    },
    summary:{
        type: String,
        required: true
    },
    operation:{
        type: String,
        required: true
    },
    problemtype:{
        type: String,
        required: true
    },
    numberofcharacters:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('problemtemplates',problemTemplateSchema)