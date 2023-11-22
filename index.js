const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const PORT = 5000;

const cookieParser = require('cookie-parser');


mongoose.connect("mongodb://127.0.0.1:27017/thabo_User_Auth")
.then(console.log("mongodb connected..."));

const express = require("express");
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// for user route
const userRoute = require('./routes/userRoute');

// for admin route
const adminRoute = require('./routes/adminRoute');

app.use('/api/users',userRoute);
app.use('/api/admin',adminRoute);

app.listen(PORT, ( ) => {
    console.log(`Server running on port ${PORT}`)
});