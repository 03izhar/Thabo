const mongoose = require('mongoose');

var securitySchema = new mongoose.Schema({
    termsAndConditions:{
        type:String,
        default: "This is Default Terms and Conditions"
    },
    privacyAndPolicy:{
        type:String,
        default: "This is Default Privacy and Policy"
    },
});

module.exports = mongoose.model('Security', securitySchema);