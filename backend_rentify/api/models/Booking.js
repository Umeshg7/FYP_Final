const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    lenderId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    renterId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    itemId: { 
        type: Schema.Types.ObjectId, 
        ref: "Rent", 
        required: true 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ["pending", "confirmed", "cancelled", "completed", "rejected"], 
        default: "pending" 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    paymentMethod: {
        type: String,
        enum: ["card", "wallet", "cash", null],
        default: null
    },
    cancellationReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);