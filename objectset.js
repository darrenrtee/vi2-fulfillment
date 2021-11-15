const mongoose = require('mongoose')
const Schema = mongoose.Schema

const objectSetSchema = new Schema({
    _id:{
        type: String,
        required: true
    },
    settype:{
        type: String,
        required: true  
    },
    object:[{
        type: String,
        required: true  
    }]
    
})

module.exports = mongoose.model('objectsets',objectSetSchema)