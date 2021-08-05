const mongoose = require('mongoose')
const Schema = mongoose.Schema

const questionSchema = new Schema({
    _id:{
        type: String,
        required: true
    },
    problem:{
        type: String,
        required: true
    },
    problemtype:{
        type: String,
        required: true
    },
    number:{
        type: Number,
        required: true
    },
    numberofquestions:{
        type: Number,
        required: true
    },
    summary:{
        type: String,
        required: true
    },
    questions:[{
        type: String,
        required:true
    }],
    questionanswers:[{
        type: String,
        required:true
    }],
    questiontypes:[{
        type: String,
        required:true
    }],
    positiveresponses:[{
        type: String,
        required:true
    }],
    hints:[{
        type: String,
        required:true
    }],
    prompts:[{
        type: String,
        required:true
    }],
    explanations:[{
        type: String,
        required:true
    }]
})

module.exports = mongoose.model('questions',questionSchema)