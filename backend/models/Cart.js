import mongoose from "mongoose";

// Define the schema
const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      wasteId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Waste", required: true 
    },
      farmerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true
    },
      description: { 
        type: String, 
        required: true 
    },
      price: { 
        type: Number, 
        required: true 
    },
      quantity: { 
        type: Number, 
        required: true, 
        default: 1 
    },
      deliveryCost: { 
        type: Number, 
        required: true 
    },
    productImage: { 
      type: String, 
      default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fimage&psig=AOvVaw0EpofGXa2hnQAqEatLDhnU&ust=1746074298883000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCJD26rT4_owDFQAAAAAdAAAAABAI" },
    }
  ],
  totalPrice: { type: Number, required: true, default: 0 }
});

export default mongoose.model("Cart", CartSchema);