//model 
import mongoose from 'mongoose';

const deliveryRequestSchema = new mongoose.Schema({
  farmerId: {
    type: Number,
    required: true
  },
  farmerPhone: {
    type: String,
    required: true
  },
  wasteType: {
    type: String,
    required: true
  },
  pickupDate: {
    type: Date,
    required: true
  },
  emergencyContact: {
    type: String,
    default: '123-456-7890', // Static value or can be overridden if needed
  },
  district: {
    type: String,
    required: true
  },
  otherDistrict: {
    type: String,
    required: function() { return this.district === 'Other'; }, // Only required if 'Other' is selected
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // Longitude first, then Latitude
      required: true,
    }
  },
  status: {
    type: String,
    default: "Pending"
  }

});

deliveryRequestSchema.index({ location: '2dsphere' }); // For geospatial queries

export default mongoose.model("DeliveryRequest", deliveryRequestSchema);
