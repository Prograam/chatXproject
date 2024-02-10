const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String
    },
    isPersonal: {
        type: Boolean,
        default: false
    }
});

const Chat = mongoose.model('Group', groupSchema); // Changed model name to Chat

module.exports = Chat;
