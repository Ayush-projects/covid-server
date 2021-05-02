const mongoose = require('mongoose')

const DB = process.env.DATABASE;
mongoose.connect(DB, { useUnifiedTopology: true, useNewUrlParser: true  }).then(()=>{
    console.log("Connected to Database")

}).catch((error)=>{
   console.log("Database Connection Error:", error)
});