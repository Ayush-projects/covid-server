const mongoose = require('mongoose')
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const helplineSchema = new mongoose.Schema({
    location_a: {
        type: String,
        required: true
    },
    location_c: {
        type: Object,
        required: true
    
        
    },
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },  
     verified: {
        type: String,
        required: true
    }, 

    avl_comment: {
        type: String,
        required: true

    }
    
})
helplineSchema.index({ location_c: "2dsphere" });
const Helpline = mongoose.model('Helpline', helplineSchema);
module.exports = Helpline;



