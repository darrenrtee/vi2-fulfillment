const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment')
const mongoose = require('mongoose')
const PROBLEMTEMPLATE = require('./problemtemplate')
const QUESTIONTEMPLATES = require('./questiontemplate')
const RESPONSETEMPLATES = require('./responsetemplate')
const COMMONSENSEONTOLOGY = require('./commonsenseontology')
const CHARACTER = require('./character')
const OBJECTSET = require('./objectset')

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
    
    function getCharacters(){
        return CHARACTER.find({type : "character"}).exec()
            .then( doc => {
            return Promise.resolve(doc);
        })
    }

    function getProblemTemplate(problemnumber){
        return PROBLEMTEMPLATE.findOne({number : problemnumber}).exec()
            .then( doc => {
            return Promise.resolve(doc);
        })
    }

    function getObjectSets(problemtype){
        return OBJECTSET.find({settype : problemtype}).exec()
            .then( doc => {
            return Promise.resolve(doc);
        })
    }

    function getHint(problemtype,numberofcharacter,currentquestion){
        return RESPONSETEMPLATES.findOne({type: "hint",problemtype:problemtype, numberofcharacters:numberofcharacter+"", questionno:currentquestion+""}).exec()
          .then( doc => {
            return Promise.resolve(doc);
        })
    }

    function getProblemSummary(problemnumber){
        console.log("Num : " + problemnumber)
        return PROBLEMTEMPLATE.findOne({number : problemnumber}).exec()
            .then( doc => {
            return Promise.resolve(doc);
        })
    }

    /**
     * This function will retrieve the question template from the question templates DB given the questionType.
     * 
     * @param {string} questionType 
     */
    function getQuestionTemplate(problemtype,numberofcharacter,currentquestion){
        return QUESTIONTEMPLATES.findOne({problemtype:problemtype,numberofcharacters:numberofcharacter+"",questionno:currentquestion+""}).exec()
          .then( doc => {
            return Promise.resolve(doc);
        })
    }

    function getQuestionGeneric(questiontype){
        return QUESTIONTEMPLATES.findOne({questiontype:questiontype}).exec()
          .then( doc => {
            return Promise.resolve(doc);
        })
    }

    /**
     * This function will retrieve the answer variable from the question templates DB given the questionType.
     * 
     * @param {string} questionType 
     */
    function getAnswer(questionType){
        return QUESTIONTEMPLATES.findOne({type: questionType}).exec()
          .then( doc => {
            return Promise.resolve(doc.answer);
        })
    }

    /**
     * This function will retrieve the uielement variable from the question templates DB given the questionType.
     * 
     * @param {string} questionType 
     */
    function getInput(questionType){
        return QUESTIONTEMPLATES.findOne({type: questionType}).exec()
          .then( doc => {
            return Promise.resolve(doc.uielement);
        })
    }

    /**
     * This function will retrieve the response template from the response templates DB given the responseType.
     * 
     * @param {string} responseType 
     */
    function getResponses(responseType){
        return RESPONSETEMPLATES.find({type: responseType}).exec()
          .then( doc => {
            return Promise.resolve(doc);
        })
    }

    /**
     * This function will retrieve the restatement template from the question templates DB given the questionType.
     * 
     * @param {string} questionType 
     */
    function getRestatement(problemtype,numberofcharacter,currentquestion){
        if(currentquestion == "9"){
            return QUESTIONTEMPLATES.findOne({questiontype:"operation"}).exec()
            .then( doc => {
                return Promise.resolve(doc.restatement);
            })
        }
        else if(currentquestion == "10"){
            return QUESTIONTEMPLATES.findOne({questiontype:"firstnumber"}).exec()
            .then( doc => {
                return Promise.resolve(doc.restatement);
            })
        }       
        else if(currentquestion == "11"){
            return QUESTIONTEMPLATES.findOne({questiontype:"secondnumber"}).exec()
            .then( doc => {
                return Promise.resolve(doc.restatement);
            })
        }
        else if(currentquestion == "12"){
            return QUESTIONTEMPLATES.findOne({questiontype:"finalanswer"}).exec()
            .then( doc => {
                return Promise.resolve(doc.restatement);
            })
        }
        else{
            return QUESTIONTEMPLATES.findOne({problemtype:problemtype,numberofcharacters:numberofcharacter+"",questionno:currentquestion+""}).exec()
            .then( doc => {
                return Promise.resolve(doc.restatement);
            })
        }
    }

    /**
     * This function will retrieve the ontology object from the question templates DB given the query to match to the first variable of the ontology object.
     * 
     * @param {string} query 
     */
    function getOntology(query){
        return COMMONSENSEONTOLOGY.findOne({first: query}).exec()
          .then( doc => {
            return Promise.resolve(doc);
        })
    }

    /**
     * This function will retrieve the ontology object from the question templates DB given the query to match to the first variable of the ontology object.
     * This function is used by the check answer intent when the students asks a question
     * @param {string} query 
     */
    function getQuestionOntology(query){
        return COMMONSENSEONTOLOGY.findOne({first: query}).exec()
          .then( doc => {
            return doc;
        })
    }

    /**
     * This function is responsible for handling the introduce chat bot intent.
     * This is the first intent that is triggered and is used to introduce Vi2 and ask for the students name
     * @param {agent} agent 
     */
    function introduceChatBotFunc(agent){
        agent.add("Hi! I'm Vi2. What's your name?")
    }
    
    /**
     * This function is responsible for handling the get student name intent.
     * This function is responsible for saving the students name and passing it as context parameters
     * @param {agent} agent 
     */
    function getStudentName(agent){
        var name = agent.parameters.name
        agent.add("Hello " + name + "! It's nice to meet you. Do you want to start the lesson?")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 2,
            "parameters":{"name": name,"problemnumber": 1}
        });
    }

    /**
     * This function is responsible for handling the get student name all intent.
     * This function is responsible for saving the students name and passing it as context parameters
     * This function is similar to the getStudentName function, but this function will be used when the name of the student is not inside their name database.
     * @param {agent} agent 
     */
    function getStudentNameAll(agent){
        var name = agent.parameters.person.name
        agent.add("Hello " + name + "! It's nice to meet you. Do you want to start the lesson?")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 2,
            "parameters":{"name": name,"problemnumber": 1}
        });
    }

    /**
     * This function is responsible for handling the get show problem intent.
     * This function is responsible for retriving the problem template and filling the template with 2 randomlly generated numbers ranging from 1-9
     * This function also retrieves all the parameters of a problem and passes it as context parameters
     * @param {agent} agent 
     */
    function showProblem(agent){
        var name = agent.getContext('expecting-ready-problem-confirmation').parameters.name
        var problemnumber = agent.getContext('expecting-ready-problem-confirmation').parameters.problemnumber
        var num1 = Math.floor(Math.random() * 9) + 1
        var num2 = Math.floor(Math.random() * 9) + 1
    
        

        return getProblemTemplate(problemnumber)
        .then( problemTemplate => {
            return getObjectSets(problemTemplate.problemtype)
            .then( objectSets => {
                return getCharacters()
                .then( characters => {
                    
                    var character1index = Math.floor(Math.random() * characters.length)
                    var character2index = Math.floor(Math.random() * characters.length)
                    var objectSetindex = Math.floor(Math.random() * objectSets.length)
                    var operation = problemTemplate.operation
                    var numberofcharacter = problemTemplate.numberofcharacters

                    var objectset = objectSets[objectSetindex].object
                    var character1 = characters[character1index].name
                    var pronoun = characters[character1index].pronoun
                    var character2 = ""
                    var action = objectset[0]
                    var pasttense = objectset[1]
                    var object = objectset[2]
                    var object1 = objectset[3]
                    var object2 = objectset[4]
                    var objectplural = objectset[5]
                    var objective = objectset[6]
                    var action2 = objectset[7]
                    var action2passtense = objectset[8]
                    var object1label = objectset[9]
                    var object2label = objectset[10]
                    var template = problemTemplate.problem
                    
                    while(character2index == character1index){
                        character2index = Math.floor(Math.random() * characters.length)
                    }
                    
                    character2 = characters[character2index].name
    
                    if(operation == "subtraction"){
                        if(num1 - num2 < 0){
                            num1 = 8
                            num2 = 4 
                        }
                        else if(num1 - num2 == 0){
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
                    
                    template = template.replace(/_n1_/g,num1)
                    template = template.replace(/_n2_/g,num2)
                    template = template.replace(/_action_/g,action)
                    template = template.replace(/_action2_/g,action2)
                    template = template.replace(/_action2pasttense_/g,action2passtense)
                    template = template.replace(/_pasttense_/g,pasttense)
                    template = template.replace(/_object_/g,object)
                    template = template.replace(/_object1_/g,object1)
                    template = template.replace(/_object2_/g,object2)
                    template = template.replace(/_objectplural_/g,objectplural)
                    template = template.replace(/_character1_/g,character1)
                    template = template.replace(/_character2_/g,character2)
                    template = template.replace(/_pronoun_/g,pronoun)
                    
                    object1label = object1label.replace(/_character1_/g,character1)
                    object1label = object1label.replace(/_character2_/g,character2)
                    object2label = object2label.replace(/_character1_/g,character1)
                    object2label = object2label.replace(/_character2_/g,character2)
                    

                    objective = objective.replace(/_character1_/g,character1)
                    objective = objective.replace(/_character2_/g,character2)
                    //agent.add(template)
                    agent.add("Problem number " + problemnumber + " will be displayed on the screen. Please type DONE once you are done reading the problem.")
                    agent.setContext({
                        "name": 'expecting-ready-question',
                        "lifespan": 2,
                        "parameters":{"problem":template,"name": name,"problemnumber": problemnumber,"currentquestion":1,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemTemplate.problemtype,"object1":object1,"object2":object2,"object1label":object1label,"object2label":object2label,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"numberofcharacter":numberofcharacter,"mistakeU":0,"mistakeF":0,"mistakeC":0}
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
    
    /**
     * This function is responsible for handling the ask question intent.
     * This function is responsible for retriving the question template and filling the template the proper parameters of the word problem
     * This function also retrieves all question variables and passes it as context parameters
     * This fucntion also initializes the counter for the number of tries the student takes to answer a question.
     * @param {agent} agent 
     */
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
        var numberofcharacter = agent.getContext('expecting-ready-question').parameters.numberofcharacter
        var objectplural = agent.getContext('expecting-ready-question').parameters.objectplural
        
        var questiontype = ""
        
        if(numberofcharacter == "1")
            questiontype = problemtype + "question" + currentquestion + "char1"
        else if (numberofcharacter == "2")
            questiontype = problemtype + "question" + currentquestion + "char2"
        
        if(currentquestion == "9"){
            return getQuestionGeneric("operation")
            .then(questionTemplate => {
                console.log(questionTemplate.question)
                var answer = questionTemplate.answer
                var temp = questionTemplate.question
                var input = questionTemplate.uielement
                
                temp = temp.replace(/_action_/g,action)
                temp = temp.replace(/_character1_/g,character1)
                temp = temp.replace(/_character2_/g,character2)
                temp = temp.replace(/_object_/g,object)
                temp = temp.replace(/_object1_/g,object1)
                temp = temp.replace(/_object2_/g,object2)
                temp = temp.replace(/_objectplural_/g,objectplural)
                temp = temp.replace(/_pasttense_/g,pasttense)
    
                agent.add(temp)
                agent.setContext({
                    "name": 'expecting-question-answer',
                    "lifespan": 2,
                    "parameters":{"name": name,"inputtype":"operationbox","problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":"other","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries":0,"numberofcharacter":numberofcharacter}
                });
            })
            .catch( error => {
                agent.add(error.toString()+"3"); 
            });
        }
        else if(currentquestion == "10"){
            return getQuestionGeneric("firstnumber")
            .then(questionTemplate => {
                console.log(questionTemplate.question)
                var answer = questionTemplate.answer
                var temp = questionTemplate.question
                var input = questionTemplate.uielement
                
                temp = temp.replace(/_action_/g,action)
                temp = temp.replace(/_character1_/g,character1)
                temp = temp.replace(/_character2_/g,character2)
                temp = temp.replace(/_object_/g,object)
                temp = temp.replace(/_object1_/g,object1)
                temp = temp.replace(/_object2_/g,object2)
                temp = temp.replace(/_objectplural_/g,objectplural)
                temp = temp.replace(/_pasttense_/g,pasttense)
    
                agent.add(temp)
                agent.setContext({
                    "name": 'expecting-question-answer',
                    "lifespan": 2,
                    "parameters":{"name": name,"inputtype":"firstnumberbox","problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":"other","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries":0,"numberofcharacter":numberofcharacter}
                });
            })
            .catch( error => {
              agent.add(error.toString()+"3"); 
            });
        }
        else if(currentquestion == "11"){
            return getQuestionGeneric("secondnumber")
            .then(questionTemplate => {
                console.log(questionTemplate.question)
                var answer = questionTemplate.answer
                var temp = questionTemplate.question
                var input = questionTemplate.uielement
                
                temp = temp.replace(/_action_/g,action)
                temp = temp.replace(/_character1_/g,character1)
                temp = temp.replace(/_character2_/g,character2)
                temp = temp.replace(/_object_/g,object)
                temp = temp.replace(/_object1_/g,object1)
                temp = temp.replace(/_object2_/g,object2)
                temp = temp.replace(/_objectplural_/g,objectplural)
                temp = temp.replace(/_pasttense_/g,pasttense)
    
                agent.add(temp)
                agent.setContext({
                    "name": 'expecting-question-answer',
                    "lifespan": 1,
                    "parameters":{"name": name,"inputtype":"secondnumberbox","problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":"other","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries":0,"numberofcharacter":numberofcharacter}
                });
            })
            .catch( error => {
              agent.add(error.toString()+"3"); 
            });
        }
        else if(currentquestion == "12"){
            return getQuestionGeneric("finalanswer")
            .then(questionTemplate => {
                console.log(questionTemplate.question)
                var answer = questionTemplate.answer
                var temp = questionTemplate.question
                var input = questionTemplate.uielement
                
                temp = temp.replace(/_action_/g,action)
                temp = temp.replace(/_character1_/g,character1)
                temp = temp.replace(/_character2_/g,character2)
                temp = temp.replace(/_object_/g,object)
                temp = temp.replace(/_object1_/g,object1)
                temp = temp.replace(/_object2_/g,object2)
                temp = temp.replace(/_objectplural_/g,objectplural)
                temp = temp.replace(/_pasttense_/g,pasttense)
    
                agent.add(temp)
                agent.setContext({
                    "name": 'expecting-question-answer',
                    "lifespan": 1,
                    "parameters":{"name": name,"inputtype":"finalanswerbox","problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":"other","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries":0,"numberofcharacter":numberofcharacter}
                });
            })
            .catch( error => {
              agent.add(error.toString()+"3"); 
            });
        }
        else{
            return getQuestionTemplate(problemtype,numberofcharacter,currentquestion)
            .then(questionTemplate => {
                console.log(questionTemplate.question)
                var answer = questionTemplate.answer
                var temp = questionTemplate.question
                var input = questionTemplate.uielement
                
                temp = temp.replace(/_action_/g,action)
                temp = temp.replace(/_character1_/g,character1)
                temp = temp.replace(/_character2_/g,character2)
                temp = temp.replace(/_object_/g,object)
                temp = temp.replace(/_object1_/g,object1)
                temp = temp.replace(/_object2_/g,object2)
                temp = temp.replace(/_objectplural_/g,objectplural)
                temp = temp.replace(/_pasttense_/g,pasttense)
    
                agent.add(temp)
                agent.setContext({
                    "name": 'expecting-question-answer',
                    "lifespan": 1,
                    "parameters":{"name": name,"inputtype":input,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":"other","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries":0,"numberofcharacter":numberofcharacter}
                });
            })
            .catch( error => {
              agent.add(error.toString()+"3"); 
            });
        }
    }

    /**
     * This function is responsible for handling the check question intent.
     * This function is responsible for retrieving and filling in the the answer variable in the context with the correct answer.
     * This function calls node-nlp and passses the correct answer and the student's input as parameters. The function will then recieve a vedict from node-nlp.
     * This function checks where the students answer is correct and also checks if the student is asking a question.
     * This funcion is filling up response templates and sending the proper responses back to dialogflow depending on the student's input
     * @param {agent} agent 
     */
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
        var numberofcharacter = agent.getContext('expecting-question-answer').parameters.numberofcharacter
        var objectplural = agent.getContext('expecting-question-answer').parameters.objectplural
        
        var tempanswerarray = answer
        var verdict = ""
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
                temp = temp.replace(/_objectplural_/g,objectplural)

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
                temp = temp.replace(/_objectplural_./g,objectplural)

                tempanswerarray[i] = temp
                
            }
            verdict= await processAnswer(tempanswerarray,agent.query)
            //var similarityindex = stringSimilarity(tempanswerarray,agent.query)
            
			console.log("VERDICT: " + verdict);
			
            if(verdict == "CORRECT" || verdict == "IN-TOPIC" || verdict == "IN-TOPIC-MISPELLING"){
               verdict = "CORRECT"
            } else {
				verdict = "WRONG"
			}
        }
            
       
        
        if(verdict == "CORRECT"){
            
            if(currentquestion + 1 <= 12){
                
                return getRestatement(problemtype,numberofcharacter,currentquestion)
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
                                restatementResponse = restatementResponse.replace(/_objectplural_/g,objectplural)

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
                                restatementResponse = restatementResponse.replace(/_objectplural_./g,objectplural)
                                
                                var positiveResponseindex = Math.floor(Math.random() * positiveResponses.length)
                                var positiveResponse = positiveResponses[positiveResponseindex].response

                                var nextQuestionPromptindex = Math.floor(Math.random() * nextQuestionPrompts.length)
                                var nextQuestionPrompt = nextQuestionPrompts[nextQuestionPromptindex].response
                                
                                finalresponse = positiveResponse + " " + restatementResponse + " " + nextQuestionPrompt
                                
                                agent.add(finalresponse)
                                agent.setContext({
                                    "name": 'expecting-ready-question',
                                    "lifespan": 1,
                                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion + 1,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries,"numberofcharacter":numberofcharacter}
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
                return getRestatement(problemtype,numberofcharacter,currentquestion)
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
                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"summary":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries,"numberofcharacter":numberofcharacter}
                    });
                })
                .catch( error => {
                agent.add(error.toString()); // Error: Unknown response type: "undefined"
                });
                
            }
        }
        else if(agent.query.includes("?")){

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
                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":tempinputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries,"numberofcharacter":numberofcharacter}
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
                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":tempinputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries,"numberofcharacter":numberofcharacter}
                    })
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
                                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1,"numberofcharacter":numberofcharacter}
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
                                    "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1,"numberofcharacter":numberofcharacter}
                                })
                            })
                            .catch( error => {
                                agent.add(error.toString()); // Error: Unknown response type: "undefined"
                            });
                        }
                        else if(inputclassification == "other"){
                            return getHint(problemtype,numberofcharacter,currentquestion)
                            .then( hints => {
                                
                                    var hint = hints.response

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
                                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"requestion":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1,"numberofcharacter":numberofcharacter}
                                    })
                            })
                            .catch( error => {
                                agent.add(error.toString()+"sa hint"); // Error: Unknown response type: "undefined"
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

                        return getRestatement(problemtype,numberofcharacter,currentquestion)
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
                                        correctAnswerprompt = correctAnswerprompt.replace(/_answer_/g,numanswer)
                                        correctAnswerprompt = correctAnswerprompt.replace(/_answer_./g,numanswer)
                                        restatementResponse = restatementResponse.replace(/_answer_/g,numanswer)
                                        restatementResponse = restatementResponse.replace(/_answer_./g,numanswer)
                                        finalresponse = negativeResponse + " " + correctAnswerprompt + " " + restatementResponse + " " + nextQuestionPrompt
                                        agent.add(finalresponse);
                                        agent.setContext({
                                            "name": 'expecting-ready-question',
                                            "lifespan": 1,
                                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion + 1,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1,"numberofcharacter":numberofcharacter}
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
                                            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"objectplural":objectplural,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"summary":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries": tries + 1,"numberofcharacter":numberofcharacter}
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

    /**
     * This function is responsible for handling the show problem summary intent.
     * This function is responsible for retrieving filling up the parameters of the problem summary template and returning it to dialogflow.
     *
     * @param {agent} agent 
     */
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
        var numberofcharacter = agent.getContext('expecting-summary-of-problem').parameters.numberofcharacter
        
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
                    var summary = summaryTemplate.summary
                   
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
                        "parameters":{"name": name,"problemnumber": problemnumber+1,"problemsummary":summary,"endlesson":"yes","mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"numberofcharacter":numberofcharacter}
                    })
                })
                .catch( error => {
                agent.add(error.toString()); // Error: Unknown response type: "undefined"
            });
        }
        else{
            return getProblemSummary(problemnumber)
            .then( summaryTemplate => {
                    var summary = summaryTemplate.summary
                    console.log(summary)
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

    /**
     * This function is responsible for handling the end lesson intent.
     * This function is the last triggered function when the lesson plan is complete.
     * This function is responsible for deleteting the context as the end lesson intent is the end of the conversation
     *
     * @param {agent} agent 
     */
    function endLesson(agent){
        var name = agent.getContext('expecting-ready-problem-confirmation').parameters.name
        console.log("kekw")
        agent.add("You have answered all the problems. Thank you for studying with me " + name +".")
    }
    
    /**
     * This function is responsible for handling the requestion intent.
     * This function is responsible for filling up question templates and sending it back to dialogflow.
     *
     * @param {agent} agent 
     */
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
        var numberofcharacter = agent.getContext('expecting-requestion').parameters.numberofcharacter
        var tries = agent.getContext('expecting-requestion').parameters.tries

        console.log(tries)
        if(currentquestion == "9"){
            return getQuestionGeneric("operation")
            .then(questionTemplate => {
                return getResponses("requestionprompt")
                .then(requestionPrompts => {
                    var temp = questionTemplate.question
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
                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries" :tries,"numberofcharacter":numberofcharacter}
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
        else if(currentquestion == "10"){
            return getQuestionGeneric("firstnumber")
            .then(questionTemplate => {
                return getResponses("requestionprompt")
                .then(requestionPrompts => {
                    var temp = questionTemplate.question
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
                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries" :tries,"numberofcharacter":numberofcharacter}
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
        else if(currentquestion == "11"){
            return getQuestionGeneric("secondnumber")
            .then(questionTemplate => {
                return getResponses("requestionprompt")
                .then(requestionPrompts => {
                    var temp = questionTemplate.question
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
                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries" :tries,"numberofcharacter":numberofcharacter}
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
        else if(currentquestion == "12"){
            return getQuestionGeneric("finalanswer")
            .then(questionTemplate => {
                return getResponses("requestionprompt")
                .then(requestionPrompts => {
                    var temp = questionTemplate.question
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
                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries" :tries,"numberofcharacter":numberofcharacter}
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
        else{
            return getQuestionTemplate(problemtype,numberofcharacter,currentquestion)
            .then(questionTemplate => {
                return getResponses("requestionprompt")
                .then(requestionPrompts => {
                    var temp = questionTemplate.question
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
                        "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"answer":answer,"questiontype":questiontype,"inputclassification":inputclassification,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"tries" :tries,"numberofcharacter":numberofcharacter}
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
        
    }

    /**
     * This function is responsible for handling the default fallback intent.
     * This function is maintaining the current context and passing it as the output context.
     *
     * @param {agent} agent 
     */
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

    /**
     * This function is responsible for handling the not ready to proceed problem intent.
     *
     * @param {agent} agent 
     */
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

     /**
     * This function is responsible for handling the break from problem intent.
     *
     * @param {agent} agent 
     */
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

    /**
     * This function is responsible for handling the explain problem intent.
     * This function fills the problem explanation template and sends it back to dialogflow
     * @param {agent} agent 
     */
    function  explainProblem(agent){
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

    /**
     * This function is responsible for handling the not ready to proceed question intent.
     *
     * @param {agent} agent 
     */
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
        var numberofcharacter = agent.getContext('expecting-ready-question').parameters.numberofcharacter
        
        agent.add("Sure thing. Do you want to take a break ?")
        agent.setContext({
            "name": 'expecting-break-question-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"numberofcharacter":numberofcharacter}
        })
    }

    /**
     * This function is responsible for handling the break question intent.
     *
     * @param {agent} agent 
     */
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
        var numberofcharacter = agent.getContext('expecting-break-question-confirmation').parameters.numberofcharacter

        if(agent.query.toLowerCase() == "yes"){
            agent.add("Okay lets take a break. Please type done when you are ready to proceed with the next question.")
            agent.setContext({
                "name": 'expecting-ready-question',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"numberofcharacter":numberofcharacter}
            })
        }
        else if (agent.query.toLowerCase() == "no"){
            agent.add("Are you ready to proceed to the next question?")
            agent.setContext({
                "name": 'expecting-ready-question',
                "lifespan": 1,
                "parameters":{"name": name,"problemnumber": problemnumber,"currentquestion":currentquestion,"num1":num1,"num2":num2,"action":action,"character1":character1,"character2":character2,"object":object,"problemtype":problemtype,"object1":object1,"object2":object2,"pasttense":pasttense,"objective":objective,"operation":operation,"mistakeU":mistakeU,"mistakeF":mistakeF,"mistakeC":mistakeC,"numberofcharacter":numberofcharacter}
            })
        }
    }

    function problem1(agent){
        var name = agent.parameters.name
        agent.add("Type Start to start Problem 1")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": 1}
        });
    }

    function problem2(agent){
        console.log("kek")
        var name = agent.parameters.name
        agent.add("Type Start to start Problem 2")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": 2}
        });
    }

    function problem3(agent){
        var name = agent.parameters.name
        agent.add("Type Start to start Problem 3")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": 3}
        });
    }
    
    function problem4(agent){
        var name = agent.parameters.name
        agent.add("Type Start to start Problem 4")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": 4}
        });
    }

    function problem5(agent){
        var name = agent.parameters.name
        agent.add("Type Start to start Problem 5")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": 5}
        });
    }

    function problem6(agent){
        var name = agent.parameters.name
        agent.add("Type Start to start Problem 6")
        agent.setContext({
            "name": 'expecting-ready-problem-confirmation',
            "lifespan": 1,
            "parameters":{"name": name,"problemnumber": 6}
        });
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
    intentMap.set("Problem1",problem1)
    intentMap.set("Problem2",problem2)
    intentMap.set("Problem3",problem3)
    intentMap.set("Problem4",problem4)
    intentMap.set("Problem5",problem5)
    intentMap.set("Problem6",problem6)
    
    
    agent.handleRequest(intentMap)

    /**
     * This function will classify the input of the user into 3 categories (object, number, character)
     *
     * @param {string} input 
     * @returns {string} classification
     */
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

    /**
     * This function will check whether the users input is correct or not.
     *
     * @param {string array} answerarray 
     * @param {string} input
     * @returns {string} verdict
     */
    async function processAnswer(answerarray,input){
        var { NlpManager } = require('node-nlp');       
        const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: false }});
       
        for(var i = 0; i < answerarray.length; i++){
            manager.addDocument('en', answerarray[i].toLowerCase(), 'CORRECT');
        }
		
        //manager.addAnswer('en', 'CORRECT', 'CORRECT');
		
        await manager.train();
        manager.save();
	   
        var response = await manager.process('en', input.toLowerCase());
		if(response.answer === 'CORRECT') {	
			console.log("CORRECT");
			return response.answer;
		} else {
			var similarityScore = stringSimilarity(answerarray, input);
		}
			
			console.log("SIMILARITY SCORE: " + similarityScore);
			if(similarityScore > 0.75) {
				return 'CORRECT';
			} else if(similarityScore > 0.5) {
				return 'CORRECT';
			} else if(similarityScore > 0.25) {
				return 'OUT-OF-TOPIC';
			} else {
				return 'OUT-OF-TOPIC-MISPELLING';
			}
		}
	   
	   return response.answer;
    }

    function stringSimilarity(answerarray,input){
        var similarity = require('similarity')
        var similarityindex = 0
		var temp = 0;
	
        for(var i = 0; i < answerarray.length; i++){
			temp = similarity(answerarray[i], input);
			if(temp > similarityindex) {
				similarityindex = temp;
			}
			var words = input.split(" ");
			for(var j = 0; j < words.length; j++) {
				temp = similarity(answerarray[i], words[j]);
				if(temp > similarityindex)
					similarityindex = temp;
			}
		}

		
        return similarityindex
    }
