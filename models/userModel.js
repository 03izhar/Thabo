const mongoose = require('mongoose');

// Declare the Schema of the User model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        index:true
    },
    username:{
        type:String,
        required:true,
        lowercase: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    images:[],
    is_verified:{
        type:Number,
        default:0
    },
    otp: {
        type: String,
        
    },
    token:{
        type:String,
        default:''
    }
}, {timestamps: true});

//Export the model
module.exports = mongoose.model('User', userSchema);