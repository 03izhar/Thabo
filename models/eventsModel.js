const mongoose = require('mongoose');

// Define the schema for the event
const eventSchema = new mongoose.Schema({
    eventBanner:{
        type: String,
        required: true
    },
    eventThumbnail:{
        type: String
    },
    eventName: {
        type: String,
        required: true
    },
    eventCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventCategory',
        required: true
    },
    startDate: {
        type: Date,
        require: true
    },
    endDate: {
        type: Date,
        require: true
    },
    eventLocation: {
        type: String,
        required: true
    },
    highlightImages: [String], // Array of image URLs
    displayName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

// Create a model using the schema
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
