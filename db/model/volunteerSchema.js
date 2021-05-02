const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const volunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }, 
    contact:{
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,

    },
    admin: {
        type: String,
        required: true,
    },
    isVerified: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required : true
    }





})
const Volunteer = mongoose.model('volunteer', volunteerSchema);
module.exports = Volunteer;