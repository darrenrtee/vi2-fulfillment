const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment')
const mongoose = require('mongoose')
const URI = 'mongodb+srv://admin:1234@maincluster.3efyv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

const curr_question = 0;

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000

mongoose.connect(URI,{ useNewUrlParser: true, useUnifiedTopology: true }).then(console.log("MongoDB Connected"))

app.post('/dialogflow-fulfillment',(request,response) => {
    dialogflowFulfillment(request,response)
})

app.listen(port, () => {
    console.log('Listening on port ' + port)
})

const dialogflowFulfillment = (request,response) => {
    const agent = new WebhookClient({request,response})

    function introduceChatBotFunc(agent){
        agent.add("Hi! I'm Vi. What's your name ? - From Webhook")
    }

    function getStudentName(agent){
        var name = agent.parameters.name
        agent.add("Hello " + name + " ! It's nice to meet you. Are you ready to start ?")
        agent.setContext({
            "name": 'expecting-ready-confirmation',
            "lifespan": 1,
            "parameters":{"name": name}
        });
    }

    function getStudentNameAll(agent){
        var name = agent.parameters.person.name
        agent.add("Hello " + name + " ! It's nice to meet you. Are you ready to start ?")
        agent.setContext({
            "name": 'expecting-ready-confirmation',
            "lifespan": 1,
            "parameters":{"name": name}
        });
    }

    function readyToStart(agent){
        var name = agent.getContext('expecting-ready-confirmation').parameters.name
        agent.add("I will be displaying the problem on the screen. Please say done once you are done reading the problem.")

        agent.setContext({
            "name": 'expecting-done-reading-problem',
            "lifespan": 1,
            "parameters":{"name": name,"problem-number": 1}
        });
    }

    let intentMap = new Map();
    intentMap.set("Introduce Chat Bot Holder",introduceChatBotFunc)
    intentMap.set("Get Student Name",getStudentName)
    intentMap.set("Get Student Name All",getStudentNameAll)
    intentMap.set("Ready To Start",readyToStart)
    agent.handleRequest(intentMap)

}
