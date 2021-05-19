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

    function getPumpingQuestion(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.pumps[question-1]);
        })
    }

    function getPumpingAnswer(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.pumpsanswer[question-1]);
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

    function getReQuestion(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.requestions[question-1]);
        })
    }

    function getNegativeResponse(number,question){
        return QUESTION.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.negativeresponses[question-1]);
        })
    }

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

    function showFirstProblem(agent){
        var name = agent.getContext('expecting-ready-confirmation').parameters.name
        
        return getNumberOfQuestions("1")
        .then( numberofquestions => {
            agent.add(" will be displayed on the screen. Please say done once you are done reading the problem.")
        
            agent.setContext({
                "name": 'expecting-done-reading-problem',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": 1,"numberofquestions":numberofquestions}
            });
        })
        .catch( error => {
          agent.add(error.toString()); // Error: Unknown response type: "undefined"
        });
        
    }
    
    function askFirstQuestion(agent){
        var name = agent.getContext('expecting-done-reading-problem').parameters.name
        var number = agent.getContext('expecting-done-reading-problem').parameters.problemnumber
        var numberofquestions = agent.getContext('expecting-done-reading-problem').parameters.numberofquestions

        return getQuestion(number,1)
        .then( question => {
          agent.add(question)
          agent.setContext({
                "name": 'expecting-first-question-answer',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": number,"currentquestion":1,"numberofquestions":numberofquestions}
            });
        })
        .catch( error => {
          agent.add(error.toString()); // Error: Unknown response type: "undefined"
        });
    }

    function checkFirstQuestionAnswer(agent){
        var name = agent.getContext('expecting-first-question-answer').parameters.name
        var number = agent.getContext('expecting-first-question-answer').parameters.problemnumber
        var numberofquestions = agent.getContext('expecting-first-question-answer').parameters.numberofquestions
        
        return getQuestionAnswer(number,1)
        .then( answer => {
          var isIncomplete = false;
    
          if(answer[0] == agent.query.toLowerCase()){
            agent.add("Congratulations! You got the correct answer! Are you ready to move on to the next question ?")
            agent.setContext({
                "name": 'expecting-ready-to-continue-question',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": number,"currentquestion":2,"numberofquestions":numberofquestions}
            });
          }
          else{
            for(var i = 1; i < answer.length; i++){
                if(answer[i] == agent.query.toLowerCase()){
                    isIncomplete = true
                    break
                }
            }

            if(isIncomplete){
                return getPumpingQuestion(number,1)
                .then( pump => {
                        agent.add(pump)
                        agent.setContext({
                            "name": 'expecting-pump-question-answer',
                            "lifespan": 1,
                            "parameters":{"name": name,"problemnumber": number,"currentquestion":1,"numberofquestions":numberofquestions}
                        });
                    })
                    .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
            }
            else{
                agent.add("That doesnt seem to be right can you try again ? ")
                agent.setContext({
                    "name": 'expecting-first-question-answer',
                    "lifespan": 1,
                    "parameters":{"name": name,"problemnumber": number,"currentquestion":1,"numberofquestions":numberofquestions}
                });
            }
          }
        })
        .catch( error => {
          agent.add(error.toString()); // Error: Unknown response type: "undefined"
        });
    }

    function checkPumpingAnswer(agent){
        var name = agent.getContext('expecting-pump-question-answer').parameters.name
        var number = agent.getContext('expecting-pump-question-answer').parameters.problemnumber
        var currentquestion = agent.getContext('expecting-pump-question-answer').parameters.currentquestion
        var numberofquestions = agent.getContext('expecting-pump-question-answer').parameters.numberofquestions
        
        return getPumpingAnswer(number,currentquestion)
        .then( answer => {
                if(answer == agent.query.toLowerCase()){
                    agent.add("Congratulations! You got the correct answer! Are you ready to move on to the next question ?")
                    agent.setContext({
                        "name": 'expecting-ready-to-continue-question',
                        "lifespan": 1,
                        "parameters":{"name": name,"problemnumber": number,"currentquestion":2,"numberofquestions":numberofquestions}
                    });
                }
                else{
                    agent.add("That doesnt seem to be right can you try again ? ")
                    agent.setContext({
                        "name": 'expecting-pump-question-answer',
                        "lifespan": 1,
                        "parameters":{"name": name,"problemnumber": number,"currentquestion":1,"numberofquestions":numberofquestions}
                    });
                }
            })
            .catch( error => {
            agent.add(error.toString()); // Error: Unknown response type: "undefined"
        });
    }

    function askSucceedingQuestion(agent){
        var name = agent.getContext('expecting-ready-to-continue-question').parameters.name
        var number = agent.getContext('expecting-ready-to-continue-question').parameters.problemnumber
        var currentquestion = agent.getContext('expecting-ready-to-continue-question').parameters.currentquestion
        var numberofquestions = agent.getContext('expecting-ready-to-continue-question').parameters.numberofquestions
        
        return getQuestion(number,currentquestion)
        .then( question => {
            return getQuestionType(number,currentquestion)
                .then( type => {
                        agent.add(question)
                        agent.setContext({
                        "name": 'expecting-succeding-question-answer',
                        "lifespan": 1,
                        "parameters":{"name": name,"problemnumber": number,"currentquestion":currentquestion,"numberofquestions":numberofquestions,"questiontype":type}
                        });
                    })
                    .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
          
        })
        .catch( error => {
          agent.add(error.toString()); // Error: Unknown response type: "undefined"
        });
    }

    function checkSuccedingQuestionAnswer(agent){
        var name = agent.getContext('expecting-succeding-question-answer').parameters.name
        var number = agent.getContext('expecting-succeding-question-answer').parameters.problemnumber
        var currentquestion = agent.getContext('expecting-succeding-question-answer').parameters.currentquestion
        var numberofquestions = agent.getContext('expecting-succeding-question-answer').parameters.numberofquestions

        return getQuestionAnswer(number,currentquestion)
        .then( answer => {
          if(answer[0] == agent.query.toLowerCase()){
            if(currentquestion + 1 <= numberofquestions){
                return getQuestionType(number,currentquestion)
                .then( type => {
                        console.log(type)
                        agent.add("Congratulations! You got the correct answer! Are you ready to move on to the next question ?")
                        agent.setContext({
                            "name": 'expecting-ready-to-continue-question',
                            "lifespan": 1,
                            "parameters":{"name": name,"problemnumber": number,"currentquestion":currentquestion+1,"numberofquestions":numberofquestions,"questiontype":type}
                        });
                    })
                    .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });

            }
            else{
                agent.add("Congratulations! You got the correct answer!")
                agent.setContext({
                    "name": 'expecting-summary-of-problem',
                    "lifespan": 1,
                    "parameters":{"name": name,"problemnumber": number,"currentquestion":1,"numberofquestions":numberofquestions}
                });
            }
          }
          else{
            
            return getQuestionType(number,currentquestion)
                .then( type => {
                        if(type!= "normal"){
                            return getHint(number,currentquestion)
                            .then( hint => {
                                agent.add(hint)
                                agent.setContext({
                                    "name": 'expecting-succeding-question-answer',
                                    "lifespan": 1,
                                    "parameters":{"name": name,"problemnumber": number,"currentquestion":currentquestion,"numberofquestions":numberofquestions}
                                });
                            })
                            .catch( error => {
                            agent.add(error.toString()); // Error: Unknown response type: "undefined"
                            });
                        }
                        else if(type === "normal"){
                            return getReQuestion(number,currentquestion)
                            .then( requestion => {
                                agent.add(requestion)
                                agent.setContext({
                                    "name": 'expecting-succeding-question-answer',
                                    "lifespan": 1,
                                    "parameters":{"name": name,"problemnumber": number,"currentquestion":currentquestion,"numberofquestions":numberofquestions}
                                });
                            })
                            .catch( error => {
                            agent.add(error.toString()); // Error: Unknown response type: "undefined"
                            });
                        }
                        else{
                            return getNegativeResponse(number,currentquestion)
                            .then( response => {
                                agent.add(response)
                                agent.setContext({
                                    "name": 'expecting-succeding-question-answer',
                                    "lifespan": 1,
                                    "parameters":{"name": name,"problemnumber": number,"currentquestion":currentquestion,"numberofquestions":numberofquestions}
                                });
                            })
                            .catch( error => {
                            agent.add(error.toString()); // Error: Unknown response type: "undefined"
                            });
                            
                        }
                    })
                    .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
          }
          
        })
        .catch( error => {
          agent.add(error.toString()); // Error: Unknown response type: "undefined"
        });
    }

    function showSuccedingProblem(agent){
        var name = agent.getContext('expecting-ready-to-continue-problem').parameters.name
        var number = agent.getContext('expecting-ready-to-continue-problem').parameters.problemnumber
        var numberofquestions = agent.getContext('expecting-ready-to-continue-problem').parameters.numberofquestions
        
        agent.add(" will be displayed on the screen. Please say done once you are done reading the problem.")
        agent.setContext({
            "name": 'expecting-done-reading-problem',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": number,"numberofquestions":numberofquestions}
        });
    }

    function showProblemSummary(agent){
        var name = agent.getContext('expecting-summary-of-problem').parameters.name
        var number = agent.getContext('expecting-summary-of-problem').parameters.problemnumber
        var numberofquestions = agent.getContext('expecting-summary-of-problem').parameters.numberofquestions
        console.log("inside showperoblem")
        return getProblemSummary(number)
            .then( summary => {
                    agent.add(summary + ". Are you ready to move on to the next problem ?")
                    agent.setContext({
                        "name": 'expecting-ready-to-continue-problem',
                        "lifespan": 1,
                        "parameters":{"name": name,"problemnumber": number,"currentquestion":1,"numberofquestions":numberofquestions}
                    })
                })
                .catch( error => {
                agent.add(error.toString()); // Error: Unknown response type: "undefined"
            });
    }

    let intentMap = new Map();
    intentMap.set("Introduce Chat Bot Holder",introduceChatBotFunc)
    intentMap.set("Get Student Name",getStudentName)
    intentMap.set("Get Student Name All",getStudentNameAll)
    intentMap.set("Show First Problem",showFirstProblem)
    intentMap.set("Ask First Question",askFirstQuestion)
    intentMap.set("Check First Question Answer",checkFirstQuestionAnswer)
    intentMap.set("Ask Succeding Question",askSucceedingQuestion)
    intentMap.set("Check Succeeding Question",checkSuccedingQuestionAnswer)
    intentMap.set("Show Succeding Problem",showSuccedingProblem)
    intentMap.set("Check Pump Question Answer",checkPumpingAnswer)
    intentMap.set("Show Problem Summary",showProblemSummary)
    agent.handleRequest(intentMap)

}
