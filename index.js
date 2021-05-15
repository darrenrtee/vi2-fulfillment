const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment')
const curr_question = 0;

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
        if(agent.query == "hi"){
            agent.add("Hi from heroku num = " + curr_question)
            agent.setContext({
                "name": 'hi-name',
                "lifespan": 1,
                "parameters":{"param": "param value"}
            });
        }
        else if(agent.query == "hello"){
            agent.add("Hello from heroku num = " + curr_question)
            agent.setContext({
                "name": 'hello-name',
                "lifespan": 1,
                "parameters":{"param": "param value"}
            });
        }
        else if(agent.query == "hey"){
            agent.add("Hey from heroku num = " + curr_question)
            agent.setContext({
                "name": 'hey-name',
                "lifespan": 1,
                "parameters":{"param": "param value"}
            });
        }
        
    }

    let intentMap = new Map();
    intentMap.set("Test",testFunc)
    agent.handleRequest(intentMap)

}
