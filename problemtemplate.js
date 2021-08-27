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
    problemtype:{
        type: String,
        required: true
    },
    summary:{
        type: String,
        required: true
    },
    action:{
        type: String,
        required: true
    },
    object:{
        type: String,
        required: true
    },
    object1:{
        type: String,
        required: true
    },
    object2:{
        type: String,
        required: true
    },
    objective:{
        type: String,
        required: true
    },
    operation:{
        type: String,
        required: true
    },
    pasttense:{
        type: String,
        required: true
    },
    character1:{
        type: String,
        required: true
    },
    character2:{
        type: String,
        required: true
    }
    
})

module.exports = mongoose.model('problemtemplates',problemTemplateSchema)