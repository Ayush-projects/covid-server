const mongoose = require('mongoose')
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const ambulanceSchema = new mongoose.Schema({
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
    comment: {
        type: String,
        required: true

    }
    
})
 ambulanceSchema.index({ location_c: "2dsphere" });
const Ambulance = mongoose.model('Ambulance', ambulanceSchema);
module.exports = Ambulance;