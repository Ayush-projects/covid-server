const mongoose = require('mongoose')
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const medicineSchema = new mongoose.Schema({
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
medicineSchema.index({ location_c: "2dsphere" });
const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;