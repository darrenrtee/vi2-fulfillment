const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment')
const mongoose = require('mongoose')
const QUESTION = require('./question')

const curr_question = 0;

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000

mongoose.connect("mongodb+srv://admin:1234@maincluster.3efyv.mongodb.net/Vi2DB?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

  
app.post('/dialogflow-fulfillment',(request,response) => {
    dialogflowFulfillment(request,response)
})

app.listen(port, () => {
    console.log('Listening on port ' + port)
})



const dialogflowFulfillment = (request,response) => {
    const agent = new WebhookClient({request,response})
    
    async function processQuestion(question){
        var { NlpManager } = require('node-nlp');       
        const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: false }});
       
        manager.addDocument('en', 'What is mang rudy ?', 'mangrudy');
        manager.addAnswer('en', 'mangrudy', 'Mang Rudy is a Fisherman');
        
        await manager.train();
        manager.save();
        var response = await manager.process('en', question);
        return response.answer;
    }

    function getQuestion(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.questions[question-1]);
        })
    }

    function getQuestionAnswer(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.questionanswers[question-1]);
        })
    }

    function getQuestionType(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.questiontypes[question-1]);
        })
    }

    function getNumberOfQuestions(number){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.numberofquestions);
        })
    }
    
    function getProblem(number){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.problem);
        })
    }


    function getProblemSummary(number){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.summary);
        })
    }

    function getHint(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.hints[question-1]);
        })
    }
    function getPrompt(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.prompts[question-1]);
        })
    }

    function getExplanation(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.explanations[question-1]);
        })
    }

    function getPositiveResponse(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.positiveresponses[question-1]);
        })
    }

    function introduceChatBotFunc(agent){
        agent.add("Hi! I'm Vi. What's your name ? - From Webhook")
    }

    function getStudentName(agent){
        var name = agent.parameters.name
        agent.add("Hello " + name + " ! It's nice to meet you. Are you ready to start ?")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"mistakes":0,"problemnumber": 1}
        });
    }

    function getStudentNameAll(agent){
        var name = agent.parameters.person.name
        agent.add("Hello " + name + " ! It's nice to meet you. Are you ready to start ?")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"mistakes":0,"problemnumber": 1}
        });
    }

    function showProblem(agent){
        var name = agent.getContext('expecting-ready-problem-confirmation').parameters.name
        var mistakes = agent.getContext('expecting-ready-problem-confirmation').parameters.mistakes
        var problemnumber = agent.getContext('expecting-ready-problem-confirmation').parameters.problemnumber
        var num1 = Math.floor(Math.random() * 10) + 1
        var num2 = Math.floor(Math.random() * 10) + 1
        return getProblem(problemnumber)
        .then( question => {
            var temp = question;
            temp = temp.replace("_n1_",num1)
            temp = temp.replace("_n2_",num2)
            return getNumberOfQuestions(problemnumber)
            .then( numberofquestions => {
                agent.add(temp + ". Please say done once you are done reading the problem.")
            
                agent.setContext({
                    "name": 'expecting-ready-question',
                    "lifespan": 1,
                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":1,"numberofquestions":numberofquestions,"mistakes":mistakes,"num1":num1,"num2":num2}
                });
            })
            .catch( error => {
            agent.add(error.toString()); 
            });
        })
        .catch( error => {
          agent.add(error.toString()); 
        });
    }
    
    function askQuestion(agent){
        var name = agent.getContext('expecting-ready-question').parameters.name
        var problemnumber = agent.getContext('expecting-ready-question').parameters.problemnumber
        var currentquestion = agent.getContext('expecting-ready-question').parameters.currentquestion
        var numberofquestions = agent.getContext('expecting-ready-question').parameters.numberofquestions
        var mistakes = agent.getContext('expecting-ready-question').parameters.mistakes
        var num1 = agent.getContext('expecting-ready-question').parameters.num1
        var num2 = agent.getContext('expecting-ready-question').parameters.num2

        return getQuestion(problemnumber,currentquestion)
        .then( question => {
            return getQuestionType(problemnumber,currentquestion)
                .then( type => {
                    return getQuestionAnswer(problemnumber,currentquestion)
                        .then( answer => {
                                agent.add(question)
                                agent.setContext({
                                    "name": 'expecting-question-answer',
                                    "lifespan": 1,
                                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"answer":answer,"tries":0,"questiontype":type,"numberofquestions":numberofquestions,"mistakes":mistakes,"num1":num1,"num2":num2}
                                });
                            })
                            .catch( error => {
                            agent.add(error.toString()); // Error: Unknown response type: "undefined"
                        });
                    })
                    .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
        })
        .catch( error => {
          agent.add(error.toString()); 
        });
    }

    async function checkQuestionAnswer(agent){
        var name = agent.getContext('expecting-question-answer').parameters.name
        var problemnumber = agent.getContext('expecting-question-answer').parameters.problemnumber
        var currentquestion = agent.getContext('expecting-question-answer').parameters.currentquestion
        var numberofquestions = agent.getContext('expecting-question-answer').parameters.numberofquestions
        var mistakes = agent.getContext('expecting-question-answer').parameters.mistakes
        var num1 = agent.getContext('expecting-question-answer').parameters.num1
        var num2 = agent.getContext('expecting-question-answer').parameters.num2
        var type = agent.getContext('expecting-question-answer').parameters.questiontype
        var answer = agent.getContext('expecting-question-answer').parameters.answer
        var tries = agent.getContext('expecting-question-answer').parameters.tries
        
        if(answer == "_n1_")
            answer = num1
        else if(answer == "_n2_")
            answer = num2
        else if(answer == "_n1_ + _n2_")
            answer = num1 + num2
            
        if(answer == agent.query.toLowerCase()){
            if(currentquestion + 1 <= numberofquestions){
                return getPositiveResponse(problemnumber,currentquestion)
                    .then( response => {
                        agent.add(response)
                        agent.setContext({
                            "name": 'expecting-ready-question',
                            "lifespan": 1,
                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion+1,"questiontype":type,"numberofquestions":numberofquestions,"mistakes":mistakes,"num1":num1,"num2":num2}
                        });
                    })
                    .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
                
            }
            else{
                agent.add("Congratulations! You solved the problem!")
                agent.setContext({
                    "name": 'expecting-summary-of-problem',
                    "lifespan": 1,
                    "parameters":{"name": name,"problemnumber": problemnumber,"mistakes":mistakes}
                });
            }
        }
        else if(agent.query.includes("?")){
            await processQuestion(agent.query).then(
                (res) => {
                    if(res == null){
                        agent.add("Sorry, I'm not so sure about that");
                        agent.setContext({
                            "name": 'expecting-requestion',
                            "lifespan": 1,
                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"answer":answer,"tries":tries,"questiontype":type,"numberofquestions":numberofquestions,"mistakes":mistakes,"num1":num1,"num2":num2}
                        })
                    }
                    else{
                        agent.add(res);
                        agent.setContext({
                            "name": 'expecting-requestion',
                            "lifespan": 1,
                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"answer":answer,"tries":tries,"questiontype":type,"numberofquestions":numberofquestions,"mistakes":mistakes,"num1":num1,"num2":num2}
                        })
                    }
                }
            );
        }
        else {
            if(tries == 0){
                return getPrompt(problemnumber,currentquestion)
                    .then( prompt => {
                        agent.add(prompt)
                        agent.setContext({
                            "name": 'expecting-requestion',
                            "lifespan": 1,
                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"answer":answer,"tries":tries+1,"questiontype":type,"numberofquestions":numberofquestions,"mistakes":mistakes,"num1":num1,"num2":num2}
                        });
                    })
                    .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
            }
            else if(tries == 1){
                return getHint(problemnumber,currentquestion)
                    .then( hint => {
                        agent.add(hint)
                        agent.setContext({
                            "name": 'expecting-requestion',
                            "lifespan": 1,
                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"answer":answer,"tries":tries+1,"questiontype":type,"numberofquestions":numberofquestions,"mistakes":mistakes,"num1":num1,"num2":num2}
                        });
                    })
                    .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
            }
            else if(tries == 2){
                return getExplanation(problemnumber,currentquestion)
                    .then( explanation => {
                        agent.add(explanation)
                        agent.setContext({
                            "name": 'expecting-ready-question',
                            "lifespan": 1,
                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion+1,"answer":answer,"tries":tries+1,"questiontype":type,"numberofquestions":numberofquestions,"mistakes":mistakes,"num1":num1,"num2":num2}
                        });
                    })
                    .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
            }
        }
    }

    function showProblemSummary(agent){
        var name = agent.getContext('expecting-summary-of-problem').parameters.name
        var mistakes = agent.getContext('expecting-summary-of-problem').parameters.mistakes
        var problemnumber = agent.getContext('expecting-summary-of-problem').parameters.problemnumber
        
        return getProblemSummary(problemnumber)
            .then( summary => {
                    agent.add(summary + ". Are you ready to move on to the next problem ?")
                    agent.setContext({
                        "name": 'expecting-ready-problem-confirmation',
                        "lifespan": 1,
                        "parameters":{"name": name,"mistakes":mistakes,"problemnumber": problemnumber+1}
                    })
                })
                .catch( error => {
                agent.add(error.toString()); // Error: Unknown response type: "undefined"
            });
    }

    function reQuestion(agent){
        var name = agent.getContext('expecting-requestion').parameters.name
        var problemnumber = agent.getContext('expecting-requestion').parameters.problemnumber
        var currentquestion = agent.getContext('expecting-requestion').parameters.currentquestion
        var numberofquestions = agent.getContext('expecting-requestion').parameters.numberofquestions
        var mistakes = agent.getContext('expecting-requestion').parameters.mistakes
        var num1 = agent.getContext('expecting-requestion').parameters.num1
        var num2 = agent.getContext('expecting-requestion').parameters.num2
        var type = agent.getContext('expecting-requestion').parameters.questiontype
        var answer = agent.getContext('expecting-requestion').parameters.answer
        var tries = agent.getContext('expecting-requestion').parameters.tries

        return getQuestion(problemnumber,currentquestion)
        .then( question => {
            agent.add("So lets go back to the question." + question)
            agent.setContext({
                "name": 'expecting-question-answer',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"answer":answer,"tries":tries,"questiontype":type,"numberofquestions":numberofquestions,"mistakes":mistakes,"num1":num1,"num2":num2}
            })
        })
        .catch( error => {
          agent.add(error.toString()); 
        });
    }

    let intentMap = new Map();
    intentMap.set("Introduce Chat Bot Holder",introduceChatBotFunc)
    intentMap.set("Get Student Name",getStudentName)
    intentMap.set("Get Student Name All",getStudentNameAll)
    intentMap.set("Show Problem",showProblem)
    intentMap.set("Ask Question",askQuestion)
    intentMap.set("Check Question Answer",checkQuestionAnswer)
    intentMap.set("Show Problem Summary",showProblemSummary)
    intentMap.set("Requestion",reQuestion)
    agent.handleRequest(intentMap)

}
