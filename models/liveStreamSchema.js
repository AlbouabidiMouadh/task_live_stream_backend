const mongoose = require("mongoose");

const schema = mongoose.Schema ;

liveStreamSchema = schema({
    title : {
        type: String,
        required : true
    },
    createdBy: {
        type: String,
        required: true
    },
    image : {
        type: String,
        required: true,
    },
    finished : {
        type: Boolean,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("LiveStream", liveStreamSchema);