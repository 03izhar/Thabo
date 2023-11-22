const mongoose = require('mongoose');

// Define the schema for the event
const eventCategorySchema = new mongoose.Schema({
    catImage:{
        type: String,
        required: true
    },
    catTitle:{
        type: String,
        required: true,
        unique: true
    }
})
const Event = mongoose.model('EventCategory', eventCategorySchema);

module.exports = Event;
