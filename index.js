const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment')
const mongoose = require('mongoose')
const PROBLEMTEMPLATE = require('./problemtemplate')
const QUESTIONTEMPLATES = require('./questiontemplate')
const RESPONSETEMPLATES = require('./responsetemplate')
const COMMONSENSEONTOLOGY = require('./commonsenseontology')
const curr_question = 0;
var posTagger = require( 'wink-pos-tagger' );
const { baseModelName, modelName } = require('./problemtemplate')
var tagger = posTagger();

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 4000

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
    
    function getAction(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.action);
        })
    }

    function getObject(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.object);
        })
    }

    function getObject1(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.object1);
        })
    }

    function getObject2(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.object2);
        })
    }

    function getCharacter1(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.character1);
        })
    }

    function getCharacter2(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.character2);
        })
    }

    function getPastTense(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.pasttense);
        })
    }

    function getObjective(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.objective);
        })
    }

    function getOperation(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.operation);
        })
    }

    function getNumberOfQuestions(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.numberofquestions);
        })
    }
    
    function getProblem(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.problem);
        })
    }

    function getProblemType(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.problemtype);
        })
    }

    function getProblemSummary(number){
        return PROBLEMTEMPLATE.findOne({number : number}).exec()
          .then( doc => {
            return Promise.resolve(doc.summary);
        })
    }

    function getQuestionTemplate(questionType){
        return QUESTIONTEMPLATES.findOne({type: questionType}).exec()
          .then( doc => {
            return Promise.resolve(doc.question);
        })
    }

    function getAnswer(questionType){
        return QUESTIONTEMPLATES.findOne({type: questionType}).exec()
          .then( doc => {
            return Promise.resolve(doc.answer);
        })
    }

    function getInput(questionType){
        return QUESTIONTEMPLATES.findOne({type: questionType}).exec()
          .then( doc => {
            return Promise.resolve(doc.uielement);
        })
    }

    function getResponses(responseType){
        return RESPONSETEMPLATES.find({type: responseType}).exec()
          .then( doc => {
            return Promise.resolve(doc);
        })
    }

    function getRestatement(responseType){
        return QUESTIONTEMPLATES.findOne({type: responseType}).exec()
          .then( doc => {
            return Promise.resolve(doc.restatement);
        })
    }


    function getOntology(query){
        return COMMONSENSEONTOLOGY.findOne({first: query}).exec()
          .then( doc => {
            return Promise.resolve(doc);
        })
    }

    function getQuestionOntology(query){
        return COMMONSENSEONTOLOGY.findOne({first: query}).exec()
          .then( doc => {
            return doc;
        })
    }

    function getTags(input){
        console.log(tagger.tagSentence(input))
    }

    function introduceChatBotFunc(agent){
        agent.add("Hi! I'm Vi2. What's your name?")
    }
    
    function getStudentName(agent){
        var name = agent.parameters.name
        agent.add("Hello " + name + " ! It's nice to meet you. Do you want to start the lesson?")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": 1}
        });
    }

    function getStudentNameAll(agent){
        var name = agent.parameters.person.name
        agent.add("Hello " + name + " ! It's nice to meet you. Do you want to start the lesson?")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": 1}
        });
    }

    function showProblem(agent){
        var name = agent.getContext('expecting-ready-problem-confirmation').parameters.name
        var problemnumber = agent.getContext('expecting-ready-problem-confirmation').parameters.problemnumber
        var num1 = Math.floor(Math.random() * 9) + 1
        var num2 = Math.floor(Math.random() * 9) + 1
    
        return getAction(problemnumber)
        .then( action => {
            return getCharacter1(problemnumber)
            .then( character1 => {
                return getCharacter2(problemnumber)
                .then( character2 => {
                    return getObject(problemnumber)
                    .then( object => {
                        return getObject1(problemnumber)
                        .then( object1 => {
                            return getObject2(problemnumber)
                            .then( object2 => {
                                return getPastTense(problemnumber)
                                .then( pasttense => {
                                    return getObjective(problemnumber)
                                    .then( objective => {
                                        return getOperation(problemnumber)
                                        .then( operation => {
                                            return getProblem(problemnumber)
                                            .then( problem => {
                                                return getProblemType(problemnumber)
                                                .then( problemtype => {
                                                    if(operation == "subtraction"){
                                                        if(num1 - num2 < 0){
                                                            num1 = 8
                                                            num2 = 4 
                                                        }
                                                    }
                                                    else if(operation == "division"){
                                                        if(num2 == 0|| num1 % num2 != 0){
                                                            num1 = 6
                                                            num2 = 2
                                                        }    
                                                    }
                                                    else if(operation == "multiplication"){
                                                        if(num1 == 0)
                                                            num1 = 1
                                                        if(num2 == 0)
                                                            num1 = 1
                                                        if(num2 > 5)
                                                            num2 = 3
                                                    }

                                                    var temp = problem
                                                    temp = temp.replace("_n1_",num1)
                                                    temp = temp.replace("_n2_",num2)
                                                    agent.add("Problem number " + problemnumber + " will be displayed on the screen. Please type DONE once you are done reading the problem.")
                                                    agent.setContext({
                                                        "name": 'expecting-ready-question',
                                                        "lifespan": 1,
                                                        "parameters":{"problem":temp,"name": name,"problemnumber": problemnumber,"currentquestion":1,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"mistakeU":0,"mistakeF":0,"mistakeC":0}
                                                    });
                                                })
                                                .catch( error => {
                                                agent.add(error.toString()); 
                                                });
                                            })
                                            .catch( error => {
                                                agent.add(error.toString()); 
                                            });
                                        })
                                        .catch( error => {
                                            agent.add(error.toString()); 
                                        });
                                    })
                                    .catch( error => {
                                        agent.add(error.toString()); 
                                    });
                                })
                                .catch( error => {
                                    agent.add(error.toString()); 
                                });
                            })
                            .catch( error => {
                                agent.add(error.toString()); 
                            });
                        })
                        .catch( error => {
                            agent.add(error.toString()); 
                        });
                    })
                    .catch( error => {
                        agent.add(error.toString()); 
                    });
                })
                .catch( error => {
                agent.add(error.toString()); 
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
        var problemtype = agent.getContext('expecting-ready-question').parameters.problemtype
        var currentquestion = agent.getContext('expecting-ready-question').parameters.currentquestion
        var num1 = agent.getContext('expecting-ready-question').parameters.num1
        var num2 = agent.getContext('expecting-ready-question').parameters.num2
        var action = agent.getContext('expecting-ready-question').parameters.action
        var character1 = agent.getContext('expecting-ready-question').parameters.character1
        var character2 = agent.getContext('expecting-ready-question').parameters.character2
        var object = agent.getContext('expecting-ready-question').parameters.object
        var object1 = agent.getContext('expecting-ready-question').parameters.object1
        var object2 = agent.getContext('expecting-ready-question').parameters.object2
        var pasttense = agent.getContext('expecting-ready-question').parameters.pasttense
        var objective = agent.getContext('expecting-ready-question').parameters.objective
        var operation = agent.getContext('expecting-ready-question').parameters.operation
        var mistakeU = agent.getContext('expecting-ready-question').parameters.mistakeU
        var mistakeF = agent.getContext('expecting-ready-question').parameters.mistakeF
        var mistakeC = agent.getContext('expecting-ready-question').parameters.mistakeC

        var questiontype = ""

        if(character2 == "N/A")
            questiontype = problemtype + "question" + currentquestion + "char1"
        else   
            questiontype = problemtype + "question" + currentquestion + "char2"

        console.log(questiontype)

        return getQuestionTemplate(questiontype)
        .then(questionTemplate => {
            return getAnswer(questiontype)
            .then(answer => {
                return getInput(questiontype)
                .then(input => {
                    var temp = questionTemplate
                    
                    temp = temp.replace(/_action_/g,action)
                    temp = temp.replace(/_character1_/g,character1)
                    temp = temp.replace(/_character2_/g,character2)
                    temp = temp.replace(/_object_/g,object)
                    temp = temp.replace(/_object1_/g,object1)
                    temp = temp.replace(/_object2_/g,object2)
                    temp = temp.replace(/_pasttense_/g,pasttense)

                    agent.add(temp)
                    agent.setContext({
                        "name": 'expecting-question-answer',
                        "lifespan": 1,
                        "parameters":{"name": name,"inputtype":input,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":"other","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries":0}
                    });
                    })
                .catch( error => {
                agent.add(error.toString()); 
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

    async function checkQuestionAnswer(agent){
        var name = agent.getContext('expecting-question-answer').parameters.name
        var problemnumber = agent.getContext('expecting-question-answer').parameters.problemnumber
        var problemtype = agent.getContext('expecting-question-answer').parameters.problemtype
        var currentquestion = agent.getContext('expecting-question-answer').parameters.currentquestion
        var num1 = agent.getContext('expecting-question-answer').parameters.num1
        var num2 = agent.getContext('expecting-question-answer').parameters.num2
        var action = agent.getContext('expecting-question-answer').parameters.action
        var character1 = agent.getContext('expecting-question-answer').parameters.character1
        var character2 = agent.getContext('expecting-question-answer').parameters.character2
        var object = agent.getContext('expecting-question-answer').parameters.object
        var object1 = agent.getContext('expecting-question-answer').parameters.object1
        var object2 = agent.getContext('expecting-question-answer').parameters.object2
        var pasttense = agent.getContext('expecting-question-answer').parameters.pasttense
        var objective = agent.getContext('expecting-question-answer').parameters.objective
        var operation = agent.getContext('expecting-question-answer').parameters.operation
        var answer = agent.getContext('expecting-question-answer').parameters.answer
        var questiontype = agent.getContext('expecting-question-answer').parameters.questiontype
        var inputclassification = agent.getContext('expecting-question-answer').parameters.inputclassification
        var mistakeU = agent.getContext('expecting-question-answer').parameters.mistakeU
        var mistakeF = agent.getContext('expecting-question-answer').parameters.mistakeF
        var mistakeC = agent.getContext('expecting-question-answer').parameters.mistakeC
        var tries = agent.getContext('expecting-question-answer').parameters.tries
        
        var tempanswerarray = answer
        var verdict
        var numanswer = ""

        if(answer[0] == "answer"){
            if(operation == "addition")
                numanswer = num1 + num2
            else if(operation == "subtraction")
                numanswer = num1 - num2
            else if(operation == "multiplication")
                numanswer = num1 * num2
            else if(operation == "division")
                numanswer = num1 / num2

            if(agent.query == numanswer)
                verdict = "CORRECT"
        }
        else{
            for(var i = 0; i < answer.length; i++){
            
                var temp = answer[i]
                temp = temp.replace(/_action_/g,action)
                temp = temp.replace(/_character1_/g,character1)
                temp = temp.replace(/_character2_/g,character2)
                temp = temp.replace(/_object_/g,object)
                temp = temp.replace(/_object1_/g,object1)
                temp = temp.replace(/_object2_/g,object2)
                temp = temp.replace(/_pasttense_/g,pasttense)
                temp = temp.replace(/_n1_/g,num1)
                temp = temp.replace(/_n2_/g,num2)
                temp = temp.replace(/_objective_/g,objective)
                temp = temp.replace(/_operation_/g,operation)

                temp = temp.replace(/_action_./g,action)
                temp = temp.replace(/_character1_./g,character1)
                temp = temp.replace(/_character2_./g,character2)
                temp = temp.replace(/_object_./g,object)
                temp = temp.replace(/_object1_./g,object1)
                temp = temp.replace(/_object2_./g,object2)
                temp = temp.replace(/_pasttense_./g,pasttense)
                temp = temp.replace(/_n1_./g,num1)
                temp = temp.replace(/_n2_./g,num2)
                temp = temp.replace(/_objective_./g,objective)
                temp = temp.replace(/_operation_./g,operation)

                tempanswerarray[i] = temp
                
            }
            verdict= await processAnswer(tempanswerarray,agent.query)
    
            if(verdict == null)
                verdict = "WRONG"
        }
            
       
        if(agent.query.includes("?")){

            var tempinputclassification = await getInputClassification(agent.query)

            if(tempinputclassification == null){
                tempinputclassification = 'other'
            }
            
            var pos = tagger.tagSentence(agent.query);
            var bagofnouns = [];
            var finalreponse
            var ontology

            for(var i = 0; i < pos.length; i ++){
                if(pos[i].pos == "NN"|| pos[i].pos == "NNP"){
                    bagofnouns.push(pos[i].normal)
                }
            }

            for(var i = 0; i < bagofnouns.length; i ++){
                ontology = await getQuestionOntology(bagofnouns[i])
                if(ontology != null)
                    break
            }

            if(ontology != null){
                finalresponse = ontology.first + " is a " + ontology.second
                finalresponse = finalresponse.charAt(0).toUpperCase() + finalresponse.slice(1);
                
                agent.add(finalresponse);
                agent.setContext({
                    "name": 'expecting-requestion',
                    "lifespan": 1,
                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":tempinputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries}
                })
            }   
            else{
                return getResponses("unknownprompt")
                .then( unknownPrompts => {

                    var unknownPromptindex = Math.floor(Math.random() * unknownPrompts.length)
                    var unknownPrompt = unknownPrompts[unknownPromptindex].response

                    agent.add(unknownPrompt);
                    agent.setContext({
                        "name": 'expecting-requestion',
                        "lifespan": 1,
                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":tempinputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries}
                    })
                })
                .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
            }
        }
        else if(verdict == "CORRECT"){
            
            if(currentquestion + 1 <= 12){
                
                return getRestatement(questiontype)
                    .then( restatement => {
                        return getResponses("positiveresponse")
                        .then( positiveResponses => {
                            return getResponses("nextquestionprompt")
                            .then( nextQuestionPrompts => {
                                var restatementResponse = restatement
                                var finalresponse = ""

                                restatementResponse = restatementResponse.replace(/_action_/g,action)
                                restatementResponse = restatementResponse.replace(/_character1_/g,character1)
                                restatementResponse = restatementResponse.replace(/_character2_/g,character2)
                                restatementResponse = restatementResponse.replace(/_object_/g,object)
                                restatementResponse = restatementResponse.replace(/_object1_/g,object1)
                                restatementResponse = restatementResponse.replace(/_object2_/g,object2)
                                restatementResponse = restatementResponse.replace(/_pasttense_/g,pasttense)
                                restatementResponse = restatementResponse.replace(/_n1_/g,num1)
                                restatementResponse = restatementResponse.replace(/_n2_/g,num2)
                                restatementResponse = restatementResponse.replace(/_objective_/g,objective)
                                restatementResponse = restatementResponse.replace(/_operation_/g,operation)
                                restatementResponse = restatementResponse.replace(/_answer_/g,numanswer)

                                restatementResponse = restatementResponse.replace(/_action_./g,action)
                                restatementResponse = restatementResponse.replace(/_character1_./g,character1)
                                restatementResponse = restatementResponse.replace(/_character2_./g,character2)
                                restatementResponse = restatementResponse.replace(/_object_./g,object)
                                restatementResponse = restatementResponse.replace(/_object1_./g,object1)
                                restatementResponse = restatementResponse.replace(/_object2_./g,object2)
                                restatementResponse = restatementResponse.replace(/_pasttense_./g,pasttense)
                                restatementResponse = restatementResponse.replace(/_n1_./g,num1)
                                restatementResponse = restatementResponse.replace(/_n2_./g,num2)
                                restatementResponse = restatementResponse.replace(/_objective_./g,objective)
                                restatementResponse = restatementResponse.replace(/_operation_./g,operation)
                                restatementResponse = restatementResponse.replace(/_answer_./g,numanswer)
                                
                                
                                var positiveResponseindex = Math.floor(Math.random() * positiveResponses.length)
                                var positiveResponse = positiveResponses[positiveResponseindex].response

                                var nextQuestionPromptindex = Math.floor(Math.random() * nextQuestionPrompts.length)
                                var nextQuestionPrompt = nextQuestionPrompts[nextQuestionPromptindex].response
                                
                                finalresponse = positiveResponse + " " + restatementResponse + " " + nextQuestionPrompt
                                
                                agent.add(finalresponse)
                                agent.setContext({
                                    "name": 'expecting-ready-question',
                                    "lifespan": 1,
                                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion + 1,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries}
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
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
            } 
            else{
                return getRestatement(questiontype)
                .then( restatement => {
                    var restatementResponse = restatement
                    restatementResponse = restatementResponse.replace(/_action_/g,action)
                    restatementResponse = restatementResponse.replace(/_character1_/g,character1)
                    restatementResponse = restatementResponse.replace(/_character2_/g,character2)
                    restatementResponse = restatementResponse.replace(/_object_/g,object)
                    restatementResponse = restatementResponse.replace(/_object1_/g,object1)
                    restatementResponse = restatementResponse.replace(/_object2_/g,object2)
                    restatementResponse = restatementResponse.replace(/_pasttense_/g,pasttense)
                    restatementResponse = restatementResponse.replace(/_n1_/g,num1)
                    restatementResponse = restatementResponse.replace(/_n2_/g,num2)
                    restatementResponse = restatementResponse.replace(/_objective_/g,objective)
                    restatementResponse = restatementResponse.replace(/_operation_/g,operation)
                    restatementResponse = restatementResponse.replace(/_answer_/g,numanswer)

                    restatementResponse = restatementResponse.replace(/_action._/g,action)
                    restatementResponse = restatementResponse.replace(/_character1_./g,character1)
                    restatementResponse = restatementResponse.replace(/_character2_./g,character2)
                    restatementResponse = restatementResponse.replace(/_object_./g,object)
                    restatementResponse = restatementResponse.replace(/_object1_./g,object1)
                    restatementResponse = restatementResponse.replace(/_object2_./g,object2)
                    restatementResponse = restatementResponse.replace(/_pasttense_./g,pasttense)
                    restatementResponse = restatementResponse.replace(/_n1_./g,num1)
                    restatementResponse = restatementResponse.replace(/_n2_./g,num2)
                    restatementResponse = restatementResponse.replace(/_objective_./g,objective)
                    restatementResponse = restatementResponse.replace(/_operation_./g,operation)
                    restatementResponse = restatementResponse.replace(/_answer_./g,numanswer)

                    agent.add("Congratulations! You solved the problem! " + restatementResponse)
                    agent.setContext({
                        "name": 'expecting-summary-of-problem',
                        "lifespan": 1,
                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"summary":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries}
                    });
                })
                .catch( error => {
                agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
                
            }
        }
        else {
           
            return getResponses("negativeresponse")
            .then( negativeResponses => {
                return getResponses("hintprompt")
                .then( hintPrompts => {

                    var negativeResponseindex = Math.floor(Math.random() * negativeResponses.length)
                    var negativeResponse = negativeResponses[negativeResponseindex].response

                    var hintPromptindex = Math.floor(Math.random() * hintPrompts.length)
                    var hintPrompt = hintPrompts[hintPromptindex].response
                    
                    if(tries == 0){

                    console.log("pasok sa 0")
                    if(currentquestion == 4 || currentquestion == 6 || currentquestion == 12){
                        mistakeC ++
                        console.log("MistakeC : " + mistakeC)
                    }
                    else if(currentquestion == 7 || currentquestion == 8){
                        mistakeU ++
                        console.log("MistakeU : " + mistakeU)
                    }
                    else if(currentquestion == 10 || currentquestion == 11){
                        mistakeF ++
                        console.log("MistakeF : " + mistakeF)
                    }

                        if(inputclassification == "character"){
                            return getOntology(character1)
                            .then( ontology => {
                                
                                finalresponse = negativeResponse + " " + hintPrompt + " " + ontology.first + " is a " + ontology.second
                                agent.add(finalresponse);
                                agent.setContext({
                                    "name": 'expecting-requestion',
                                    "lifespan": 1,
                                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1}
                                })
                            })
                            .catch( error => {
                                agent.add(error.toString()); // Error: Unknown response type: "undefined"
                            });
                        }
                        else if(inputclassification == "object"){
                            return getOntology(object1)
                            .then( ontology => {
                                
                                finalresponse = negativeResponse + " " + hintPrompt + " " + ontology.first + " is a " + ontology.second
                                agent.add(finalresponse);
                                agent.setContext({
                                    "name": 'expecting-requestion',
                                    "lifespan": 1,
                                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1}
                                })
                            })
                            .catch( error => {
                                agent.add(error.toString()); // Error: Unknown response type: "undefined"
                            });
                        }
                        else if(inputclassification == "other"){
                            return getResponses(questiontype+"hint")
                            .then( hints => {
                                
                                    var hintindex = Math.floor(Math.random() * hints.length)
                                    var hint = hints[hintindex].response

                                    hint = hint.replace(/_action_/g,action)
                                    hint = hint.replace(/_character1_/g,character1)
                                    hint = hint.replace(/_character2_/g,character2)
                                    hint = hint.replace(/_object_/g,object)
                                    hint = hint.replace(/_object1_/g,object1)
                                    hint = hint.replace(/_object2_/g,object2)
                                    hint = hint.replace(/_pasttense_/g,pasttense)
                                    hint = hint.replace(/_n1_/g,num1)
                                    hint = hint.replace(/_n2_/g,num2)
                                    hint = hint.replace(/_objective_/g,objective)
                                    hint = hint.replace(/_operation_/g,operation)
                                    hint = hint.replace(/_answer_/g,tempanswerarray[0])
                   
                                    hint = hint.replace(/_action_./g,action)
                                    hint = hint.replace(/_character1_./g,character1)
                                    hint = hint.replace(/_character2_./g,character2)
                                    hint = hint.replace(/_object_./g,object)
                                    hint = hint.replace(/_object1_./g,object1)
                                    hint = hint.replace(/_object2_./g,object2)
                                    hint = hint.replace(/_pasttense_./g,pasttense)
                                    hint = hint.replace(/_n1_./g,num1)
                                    hint = hint.replace(/_n2_./g,num2)
                                    hint = hint.replace(/_objective_./g,objective)
                                    hint = hint.replace(/_operation_./g,operation)
                                    hint = hint.replace(/_answer_./g,tempanswerarray[0])

                                    finalresponse = negativeResponse + " " + hintPrompt + " " + hint
                                    agent.add(finalresponse);
                                    agent.setContext({
                                        "name": 'expecting-requestion',
                                        "lifespan": 1,
                                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1}
                                    })
                            })
                            .catch( error => {
                                agent.add(error.toString()); // Error: Unknown response type: "undefined"
                            });
                        }
                    }
                    else if(tries == 1){

                        if(currentquestion == 4 || currentquestion == 6 || currentquestion == 12){
                            mistakeC ++
                            console.log("MistakeC : " + mistakeC)
                        }
                        else if(currentquestion == 7 || currentquestion == 8){
                            mistakeU ++
                            console.log("MistakeU : " + mistakeU)
                        }
                        else if(currentquestion == 10 || currentquestion == 11){
                            mistakeF ++
                            console.log("MistakeF : " + mistakeF)
                        }

                        return getRestatement(questiontype)
                        .then( restatement => {
                            return getResponses("nextquestionprompt")
                            .then( nextQuestionPrompts => {
                                return getResponses("correctanswerprompt")
                                .then( correctAnswerprompts => {
                                    var nextQuestionPromptindex = Math.floor(Math.random() * nextQuestionPrompts.length)
                                    var nextQuestionPrompt = nextQuestionPrompts[nextQuestionPromptindex].response
                                    
                                    var correctAnswerPromptsindex = Math.floor(Math.random() * correctAnswerprompts.length)
                                    var correctAnswerprompt = correctAnswerprompts[correctAnswerPromptsindex].response
                                    
                                    restatementResponse = restatement

                                    restatementResponse = restatementResponse.replace(/_action_/g,action)
                                    restatementResponse = restatementResponse.replace(/_character1_/g,character1)
                                    restatementResponse = restatementResponse.replace(/_character2_/g,character2)
                                    restatementResponse = restatementResponse.replace(/_object_/g,object)
                                    restatementResponse = restatementResponse.replace(/_object1_/g,object1)
                                    restatementResponse = restatementResponse.replace(/_object2_/g,object2)
                                    restatementResponse = restatementResponse.replace(/_pasttense_/g,pasttense)
                                    restatementResponse = restatementResponse.replace(/_n1_/g,num1)
                                    restatementResponse = restatementResponse.replace(/_n2_/g,num2)
                                    restatementResponse = restatementResponse.replace(/_objective_/g,objective)
                                    restatementResponse = restatementResponse.replace(/_operation_/g,operation)

                                    restatementResponse = restatementResponse.replace(/_action_./g,action)
                                    restatementResponse = restatementResponse.replace(/_character1_./g,character1)
                                    restatementResponse = restatementResponse.replace(/_character2_./g,character2)
                                    restatementResponse = restatementResponse.replace(/_object_./g,object)
                                    restatementResponse = restatementResponse.replace(/_object1_./g,object1)
                                    restatementResponse = restatementResponse.replace(/_object2_./g,object2)
                                    restatementResponse = restatementResponse.replace(/_pasttense_./g,pasttense)
                                    restatementResponse = restatementResponse.replace(/_n1_./g,num1)
                                    restatementResponse = restatementResponse.replace(/_n2_./g,num2)
                                    restatementResponse = restatementResponse.replace(/_objective_./g,objective)
                                    restatementResponse = restatementResponse.replace(/_operation_./g,operation)
                                    
                                    if(currentquestion + 1 <= 12){
                                        correctAnswerprompt = correctAnswerprompt.replace(/_answer_/g,tempanswerarray[0])
                                        correctAnswerprompt = correctAnswerprompt.replace(/_answer_./g,tempanswerarray[0])
                                        restatementResponse = restatementResponse.replace(/_answer_/g,tempanswerarray[0])
                                        restatementResponse = restatementResponse.replace(/_answer_./g,tempanswerarray[0])
                                        finalresponse = negativeResponse + " " + correctAnswerprompt + " " + restatementResponse + " " + nextQuestionPrompt
                                        agent.add(finalresponse);
                                        agent.setContext({
                                            "name": 'expecting-ready-question',
                                            "lifespan": 1,
                                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion + 1,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1}
                                        });
                                    }
                                    else{
                                        correctAnswerprompt = correctAnswerprompt.replace(/_answer_/g,numanswer)
                                        correctAnswerprompt = correctAnswerprompt.replace(/_answer_./g,numanswer)
                                        restatementResponse = restatementResponse.replace(/_answer_/g,numanswer)
                                        restatementResponse = restatementResponse.replace(/_answer_./g,numanswer)
                                        finalresponse = negativeResponse + " " + correctAnswerprompt + " " + restatementResponse + " " + nextQuestionPrompt
                                        agent.add(finalresponse)
                                        agent.setContext({
                                            "name": 'expecting-summary-of-problem',
                                            "lifespan": 1,
                                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"summary":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1}
                                        });
                                    }
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
                            agent.add(error.toString()); // Error: Unknown response type: "undefined"
                        });
                    }
                })
                .catch( error => {
                    agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
            })
            .catch( error => {
                agent.add(error.toString()); // Error: Unknown response type: "undefined"
            });
            
        }
    }

    function showProblemSummary(agent){
        var name = agent.getContext('expecting-summary-of-problem').parameters.name
        var problemnumber = agent.getContext('expecting-summary-of-problem').parameters.problemnumber
        var problemtype = agent.getContext('expecting-summary-of-problem').parameters.problemtype
        var currentquestion = agent.getContext('expecting-summary-of-problem').parameters.currentquestion
        var num1 = agent.getContext('expecting-summary-of-problem').parameters.num1
        var num2 = agent.getContext('expecting-summary-of-problem').parameters.num2
        var action = agent.getContext('expecting-summary-of-problem').parameters.action
        var character1 = agent.getContext('expecting-summary-of-problem').parameters.character1
        var character2 = agent.getContext('expecting-summary-of-problem').parameters.character2
        var object = agent.getContext('expecting-summary-of-problem').parameters.object
        var object1 = agent.getContext('expecting-summary-of-problem').parameters.object1
        var object2 = agent.getContext('expecting-summary-of-problem').parameters.object2
        var pasttense = agent.getContext('expecting-summary-of-problem').parameters.pasttense
        var objective = agent.getContext('expecting-summary-of-problem').parameters.objective
        var operation = agent.getContext('expecting-summary-of-problem').parameters.operation
        var answer = agent.getContext('expecting-summary-of-problem').parameters.answer
        var questiontype = agent.getContext('expecting-summary-of-problem').parameters.questiontype
        var mistakeU = agent.getContext('expecting-summary-of-problem').parameters.mistakeU
        var mistakeF = agent.getContext('expecting-summary-of-problem').parameters.mistakeF
        var mistakeC = agent.getContext('expecting-summary-of-problem').parameters.mistakeC
        var ans
        
        if(operation == "addition")
            ans = num1 + num2
        else if(operation == "subtraction")
            ans = num1 - num2
        else if(operation == "multiplication")
            ans = num1 * num2
        else if(operation == "division")
            ans = num1 / num2

        if(problemnumber == 6){
            return getProblemSummary(problemnumber)
            .then( summaryTemplate => {
                    var summary = summaryTemplate
                   
                    summary = summary.replace(/_action_/g,action)
                    summary = summary.replace(/_character1_/g,character1)
                    summary = summary.replace(/_character2_/g,character2)
                    summary = summary.replace(/_object_/g,object)
                    summary = summary.replace(/_object1_/g,object1)
                    summary = summary.replace(/_object2_/g,object2)
                    summary = summary.replace(/_pasttense_/g,pasttense)
                    summary = summary.replace(/_n1_/g,num1)
                    summary = summary.replace(/_n2_/g,num2)
                    summary = summary.replace(/_answer_/g,ans)

                    agent.add(summary)
                    agent.setContext({
                        "name": 'expecting-ready-problem-confirmation',
                        "lifespan": 1,
                        "parameters":{"name": name,"problemnumber": problemnumber+1,"problemsummary":summary,"endlesson":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC}
                    })
                })
                .catch( error => {
                agent.add(error.toString()); // Error: Unknown response type: "undefined"
            });
        }
        else{
            return getProblemSummary(problemnumber)
            .then( summaryTemplate => {
                    var summary = summaryTemplate
                   
                    summary = summary.replace(/_action_/g,action)
                    summary = summary.replace(/_character1_/g,character1)
                    summary = summary.replace(/_character2_/g,character2)
                    summary = summary.replace(/_object_/g,object)
                    summary = summary.replace(/_object1_/g,object1)
                    summary = summary.replace(/_object2_/g,object2)
                    summary = summary.replace(/_pasttense_/g,pasttense)
                    summary = summary.replace(/_n1_/g,num1)
                    summary = summary.replace(/_n2_/g,num2)
                    summary = summary.replace(/_answer_/g,ans)

                    summary = summary.replace(/_action_./g,action)
                    summary = summary.replace(/_character1_./g,character1)
                    summary = summary.replace(/_character2_./g,character2)
                    summary = summary.replace(/_object_./g,object)
                    summary = summary.replace(/_object1_./g,object1)
                    summary = summary.replace(/_object2_./g,object2)
                    summary = summary.replace(/_pasttense_./g,pasttense)
                    summary = summary.replace(/_n1_./g,num1)
                    summary = summary.replace(/_n2_./g,num2)
                    summary = summary.replace(/_answer_./g,ans)

                    agent.add(summary + " Are you ready to move on to the next problem?")
                    agent.setContext({
                        "name": 'expecting-ready-problem-confirmation',
                        "lifespan": 1,
                        "parameters":{"name": name,"problemnumber": problemnumber+1,"problemsummary":summary,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC}
                    })
                })
                .catch( error => {
                agent.add(error.toString()); // Error: Unknown response type: "undefined"
            });
        }
        
    }

    function endLesson(agent){
        var name = agent.getContext('expecting-ready-problem-confirmation').parameters.name
        console.log("kekw")
        agent.add("Your have answered all the problem. Thank you for studying with me " + name +".")
    }
    
    function reQuestion(agent){
        var name = agent.getContext('expecting-requestion').parameters.name
        var problemnumber = agent.getContext('expecting-requestion').parameters.problemnumber
        var problemtype = agent.getContext('expecting-requestion').parameters.problemtype
        var currentquestion = agent.getContext('expecting-requestion').parameters.currentquestion
        var num1 = agent.getContext('expecting-requestion').parameters.num1
        var num2 = agent.getContext('expecting-requestion').parameters.num2
        var action = agent.getContext('expecting-requestion').parameters.action
        var character1 = agent.getContext('expecting-requestion').parameters.character1
        var character2 = agent.getContext('expecting-requestion').parameters.character2
        var object = agent.getContext('expecting-requestion').parameters.object
        var object1 = agent.getContext('expecting-requestion').parameters.object1
        var object2 = agent.getContext('expecting-requestion').parameters.object2
        var pasttense = agent.getContext('expecting-requestion').parameters.pasttense
        var objective = agent.getContext('expecting-requestion').parameters.objective
        var operation = agent.getContext('expecting-requestion').parameters.operation
        var answer = agent.getContext('expecting-requestion').parameters.answer
        var questiontype = agent.getContext('expecting-requestion').parameters.questiontype
        var inputclassification = agent.getContext('expecting-requestion').parameters.inputclassification
        var mistakeU = agent.getContext('expecting-requestion').parameters.mistakeU
        var mistakeF = agent.getContext('expecting-requestion').parameters.mistakeF
        var mistakeC = agent.getContext('expecting-requestion').parameters.mistakeC
        var tries = agent.getContext('expecting-requestion').parameters.tries

        console.log(tries)

        return getQuestionTemplate(questiontype)
        .then(questionTemplate => {
            return getResponses("requestionprompt")
            .then(requestionPrompts => {
                var temp = questionTemplate
                var requestionPromptindex = Math.floor(Math.random() * requestionPrompts.length)
                var requestionPrompt = requestionPrompts[requestionPromptindex].response

                temp = temp.replace(/_action_/g,action)
                temp = temp.replace(/_character1_/g,character1)
                temp = temp.replace(/_character2_/g,character2)
                temp = temp.replace(/_object_/g,object)
                temp = temp.replace(/_object1_/g,object1)
                temp = temp.replace(/_object2_/g,object2)
                temp = temp.replace(/_pasttense_/g,pasttense)
                    
                temp = temp.replace(/_action_./g,action)
                temp = temp.replace(/_character1_./g,character1)
                temp = temp.replace(/_character2_./g,character2)
                temp = temp.replace(/_object_./g,object)
                temp = temp.replace(/_object1_./g,object1)
                temp = temp.replace(/_object2_./g,object2)
                temp = temp.replace(/_pasttense_./g,pasttense)
                
                var finalresponse = requestionPrompt + " " + temp

                agent.add(finalresponse)
                agent.setContext({
                    "name": 'expecting-question-answer',
                    "lifespan": 1,
                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries" :tries}
                })
            })
            .catch( error => {
            agent.add(error.toString()); 
            });
        })
        .catch( error => {
          agent.add(error.toString()); 
        });
    }

    function defaultFallbackIntent(agent){
        var contextname = ""
        var parameters = ""

        if(agent.contexts[0].name == "__system_counters__"){
            contextname = agent.contexts[1].name
            parameters = agent.contexts[1].parameters
        }
        else{
            contextname = agent.contexts[0].name
            parameters = agent.contexts[0].parameters
        }

        const responses = ["Sorry, could you say that again?","I didn't get that. Can you say it again?","What was that?","I missed that, say that again?"]
        var index = Math.floor(Math.random() * responses.length)
        
        agent.add(responses[index])
        agent.setContext({
            "name": contextname,
            "lifespan": 1,
            "parameters":parameters
        })

    }

    function notReadyToProceedProblem(agent){
        var name = agent.getContext('expecting-ready-problem-confirmation').parameters.name
        var problemnumber = agent.getContext('expecting-ready-problem-confirmation').parameters.problemnumber

        if(problemnumber == "1"){
            agent.add("Okay. See you next time. Have a great day!")
        }
        else{
            var problemsummary = agent.getContext('expecting-ready-problem-confirmation').parameters.problemsummary
            agent.add("Sure thing. Do you want to take a break ?")
            agent.setContext({
                "name": 'expecting-break-problem-confirmation',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": problemnumber,"problemsummary":problemsummary}
            })
        }
    }

    function breakFromProblem(agent){
        var name = agent.getContext('expecting-break-problem-confirmation').parameters.name
        var problemnumber = agent.getContext('expecting-break-problem-confirmation').parameters.problemnumber
        var problemsummary = agent.getContext('expecting-break-problem-confirmation').parameters.problemsummary

        if(agent.query.toLowerCase() == "no"){
            agent.add("Okay, do you want me to explain the problem again ?")
            agent.setContext({
                "name": 'expecting-explain-problem-confirmation',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": problemnumber,"problemsummary":problemsummary}
            })
        }
        else if(agent.query.toLowerCase() == "yes"){
            agent.add("Okay lets take a break. Please type DONE when you are ready to proceed with the next problem.")
            agent.setContext({
                "name": 'expecting-ready-problem-confirmation',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": problemnumber}
            })
        }
    }

    function explainProblem(agent){
        var name = agent.getContext('expecting-explain-problem-confirmation').parameters.name
        var problemnumber = agent.getContext('expecting-explain-problem-confirmation').parameters.problemnumber
        var problemsummary = agent.getContext('expecting-explain-problem-confirmation').parameters.problemsummary

        if(agent.query.toLowerCase() == "no"){
            agent.add("Okay, are you ready to move on to the next problem?")
            agent.setContext({
                "name": 'expecting-ready-problem-confirmation',
                "lifespan": 1,
                "parameters":{"name": modelName,"problemnumber": problemnumber,"problemsummary":problemsummary}
            })
        }
        else if(agent.query.toLowerCase() == "yes"){
            agent.add("Okay, let me explain the problem again. " + problemsummary + ".Are you ready to move to the next problem ?")
            agent.setContext({
                "name": 'expecting-ready-problem-confirmation',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": problemnumber,"problemsummary":problemsummary}
            })
        }
    }

    function notReadyToProceedQuestion(agent){
        var name = agent.getContext('expecting-ready-question').parameters.name
        var problemnumber = agent.getContext('expecting-ready-question').parameters.problemnumber
        var problemtype = agent.getContext('expecting-ready-question').parameters.problemtype
        var currentquestion = agent.getContext('expecting-ready-question').parameters.currentquestion
        var num1 = agent.getContext('expecting-ready-question').parameters.num1
        var num2 = agent.getContext('expecting-ready-question').parameters.num2
        var action = agent.getContext('expecting-ready-question').parameters.action
        var character1 = agent.getContext('expecting-ready-question').parameters.character1
        var character2 = agent.getContext('expecting-ready-question').parameters.character2
        var object = agent.getContext('expecting-ready-question').parameters.object
        var object1 = agent.getContext('expecting-ready-question').parameters.object1
        var object2 = agent.getContext('expecting-ready-question').parameters.object2
        var pasttense = agent.getContext('expecting-ready-question').parameters.pasttense
        var objective = agent.getContext('expecting-ready-question').parameters.objective
        var operation = agent.getContext('expecting-ready-question').parameters.operation
        var mistakeU = agent.getContext('expecting-ready-question').parameters.mistakeU
        var mistakeF = agent.getContext('expecting-ready-question').parameters.mistakeF
        var mistakeC = agent.getContext('expecting-ready-question').parameters.mistakeC
        
        agent.add("Sure thing. Do you want to take a break ?")
        agent.setContext({
            "name": 'expecting-break-question-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC}
        })
    }

    function breakFromQuestion(agent){
        var name = agent.getContext('expecting-break-question-confirmation').parameters.name
        var problemnumber = agent.getContext('expecting-break-question-confirmation').parameters.problemnumber
        var problemtype = agent.getContext('expecting-break-question-confirmation').parameters.problemtype
        var currentquestion = agent.getContext('expecting-break-question-confirmation').parameters.currentquestion
        var num1 = agent.getContext('expecting-break-question-confirmation').parameters.num1
        var num2 = agent.getContext('expecting-break-question-confirmation').parameters.num2
        var action = agent.getContext('expecting-break-question-confirmation').parameters.action
        var character1 = agent.getContext('expecting-break-question-confirmation').parameters.character1
        var character2 = agent.getContext('expecting-break-question-confirmation').parameters.character2
        var object = agent.getContext('expecting-break-question-confirmation').parameters.object
        var object1 = agent.getContext('expecting-break-question-confirmation').parameters.object1
        var object2 = agent.getContext('expecting-break-question-confirmation').parameters.object2
        var pasttense = agent.getContext('expecting-break-question-confirmation').parameters.pasttense
        var objective = agent.getContext('expecting-break-question-confirmation').parameters.objective
        var operation = agent.getContext('expecting-break-question-confirmation').parameters.operation
        var mistakeU = agent.getContext('expecting-break-question-confirmation').parameters.mistakeU
        var mistakeF = agent.getContext('expecting-break-question-confirmation').parameters.mistakeF
        var mistakeC = agent.getContext('expecting-break-question-confirmation').parameters.mistakeC

        if(agent.query.toLowerCase() == "yes"){
            agent.add("Okay lets take a break. Please type done when you are ready to proceed with the next problem.")
            agent.setContext({
                "name": 'expecting-ready-question',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC}
            })
        }
    }

    let intentMap = new Map();
    intentMap.set("Introduce Chat Bot Holder",introduceChatBotFunc)
    intentMap.set("Get Student Name",getStudentName)
    intentMap.set("Get Student Name All",getStudentNameAll)
    intentMap.set("Not Ready To Proceed Problem",notReadyToProceedProblem)
    intentMap.set("Not Ready To Proceed Question",notReadyToProceedQuestion)
    intentMap.set("Explain Problem",explainProblem)
    intentMap.set("Break From Question",breakFromQuestion)
    intentMap.set("Break From Problem",breakFromProblem)
    intentMap.set("Show Problem",showProblem)
    intentMap.set("Ask Question",askQuestion)
    intentMap.set("Check Question Answer",checkQuestionAnswer)
    intentMap.set("Show Problem Summary",showProblemSummary)
    intentMap.set("Requestion",reQuestion)
    intentMap.set("Default Fallback Intent",defaultFallbackIntent)
    intentMap.set("End Lesson",endLesson)
    
    
    agent.handleRequest(intentMap)

    async function getInputClassification(input){
        var { NlpManager } = require('node-nlp');       
        const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: false }});
       
        manager.addDocument('en', 'rudy', 'character');
        manager.addDocument('en', 'raul', 'character');
        manager.addDocument('en', 'maria', 'character');
        manager.addDocument('en', 'angelica', 'character');
        manager.addDocument('en', 'petra', 'character');
        manager.addDocument('en', 'ate lory', 'character');
        manager.addDocument('en', 'mrs sales', 'character');

        manager.addDocument('en', 'fish', 'object');
        manager.addDocument('en', 'galunggong', 'object');
        manager.addDocument('en', 'marbles', 'object');
        manager.addDocument('en', 'bangus', 'object');
        manager.addDocument('en', 'pencils', 'object');
        manager.addDocument('en', 'eggs', 'object');
        manager.addDocument('en', 'bibingkas', 'object');
        manager.addDocument('en', 'flowers', 'object');
        manager.addDocument('en', 'baskets', 'object');
        
        manager.addDocument('en', '1234', 'number');
        manager.addDocument('en', '1234567890', 'number');

        manager.addAnswer('en', 'object', 'object');
        manager.addAnswer('en', 'number', 'number');
        manager.addAnswer('en', 'character', 'character');
        
        await manager.train();
        manager.save();
        var response = await manager.process('en', input);
        return response.answer;
    }

    async function processAnswer(answerarray,input){
        var { NlpManager } = require('node-nlp');       
        const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: false }});
       
        for(var i = 0; i < answerarray.length; i++){
            manager.addDocument('en', answerarray[i], 'CORRECT');
        }
        
        manager.addAnswer('en', 'CORRECT', 'CORRECT');
        
        await manager.train();
        manager.save();
        var response = await manager.process('en', input);
        return response.answer;
    }

}
