const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');

const db = require("./db");
const collection = "todo";
const app = express();

const schema = Joi.object().keys({
    todo : Joi.string().required()
});


app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/getTodos', (req, res) => {
    db.getDB().collection(collection).find({}).toArray((err, documents) => {
        if (err) { console.log(err); }
        else {
            res.json(documents);
        }
    });
});


app.put('/:id', (req, res) => {
    const todoID = req.params.id;
    const userInput = req.body;

    db.getDB().collection(collection).findOneAndUpdate({ _id: db.getPrimaryKey(todoID) }, { $set: { todoID: userInput.todo } }, { returnOriginal: false }, (err, result) => {
        if (err)
            console.log(err);
        else
            res.json(result);
    });
})

app.post('/', (req, res) => {
    const userInput = req.body;

    Joi.validate(userInput,schema, (err, result) => {
        if(err){
            const error = new Error("invalid");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(userInput, (err, result) => {
                if (err){
                    const error = new Error("failed to insert user input");
                    error.status = 400;
                    next(error);
                }   
                else
                    res.json({ result: result, document: result.ops[0], msg : "successful", error: null});
            });
        }
    })
   
})

app.delete('/:id', (req, res) => {
    const todoID = req.params.id;

    db.getDB().collection(collection).findOneAndDelete({ _id: db.getPrimaryKey(todoID) }, (err, result) => {
        if (err)
            console.log(err);
        else
            res.json(result);
    })
})

app.use((err,req,res,next)=>{
    res.status(err.status).json({ 
        error:{
            message: err.message
        }})
})
 
db.connect((err) => {
    if (err) {
        console.log("unable to connect to db");
        process.exit(1);
    }
    else {
        app.listen(3000, () => {
            console.log('app listening to port 3000');
        })

    }
})

