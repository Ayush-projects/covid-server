const express = require('express')
const app = express()
const dotenv = require('dotenv')
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');


dotenv.config({path: './config.env'});
require('./db/conn');

const Volunteer = require('./db/model/volunteerSchema')

//Middlewares
app.use(require('./router/auth'))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });
app.use(express.static(__dirname +"/public"))

app.set('view engine', 'ejs')
app.listen(port, (error)=>{
    if(error)
    console.log("Error on Listening: ", error);
    else
    console.log("Server Running on PORT: ", port);
})
