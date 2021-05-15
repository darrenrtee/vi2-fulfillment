const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment')
const kek = 0;

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000

app.post('/dialogflow-fulfillment',(request,response) => {
    dialogflowFulfillment(request,response)
})

app.listen(port, () => {
    console.log('Listening on port ' + port)
})

const dialogflowFulfillment = (request,response) => {
    const agent = new WebhookClient({request,response})

    function testFunc(agent){
        agent.add("Hi from heroku num = "+ kek)
        kek++
    }
    
    let intentMap = new Map();
    intentMap.set("Test",testFunc)
    agent.handleRequest(intentMap)
}