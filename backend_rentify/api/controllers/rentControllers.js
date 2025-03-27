const Rent = require("../models/Rent");
const mongoose = require("mongoose");

// Get all approved rent items (for users)
const getAllRentItems = async (req, res) => {
  try {
    const rents = await Rent.find({ adminVerified: true }); // Only approved items
    res.status(200).json(rents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getRentItemById = async (req, res) => {
  try {
    const rentId = req.params.id;
    console.log("Requested Rent ID:", rentId); // Debug: Log the ID

    // Check if the ID is a valid MongoDB ObjectID
    if (!mongoose.Types.ObjectId.isValid(rentId)) {
      console.log("Invalid Rent ID:", rentId); // Debug: Log invalid ID
      return res.status(400).json({ message: "Invalid rent item ID" });
    }

    // Find the rent item by ID
    const rentItem = await Rent.findById(rentId);
    console.log("Found Rent Item:", rentItem); // Debug: Log the found item

    // If the item doesn't exist, return a 404
    if (!rentItem) {
      console.log("Rent Item Not Found for ID:", rentId); // Debug: Log if item not found
      return res.status(404).json({ message: "Item not found" });
    }

    // Return the rent item
    res.status(200).json(rentItem);
  } catch (error) {
    console.error("Error fetching rent item:", error); // Debug: Log any errors
    res.status(500).json({ message: error.message });
  }
};


// Get all rent items (for admin)
const getAllItemsForAdmin = async (req, res) => {
  try {
    const rents = await Rent.find({}); // Fetch all items (approved + pending)
    res.status(200).json(rents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a rent item
const deleteRentItem = async (req, res) => {
  try {
    const rentId = req.params.id;

    // Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(rentId)) {
      return res.status(400).json({ message: "Invalid rent item ID" });
    }

    const deletedItem = await Rent.findByIdAndDelete(rentId);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully", deletedItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post a new rent item (Initially Unverified)
const postRentItem = async (req, res) => {
  try {
    console.log("Received Request Body:", req.body);

    if (!req.body.userEmail) {
      return res.status(400).json({ message: "User email is required." });
    }

    // Store the rent item in MongoDB
    const newRentItem = new Rent(req.body); // No images field for now
    const savedRentItem = await newRentItem.save();

    res.status(201).json(savedRentItem); // Return the saved rent item
  } catch (error) {
    console.error("Error saving rent item:", error);
    res.status(500).json({ message: "Error saving item." });
  }
};

// Reject an item (Admin only)
const rejectRentItem = async (req, res) => {
  try {
    const rentId = req.params.id;

    // Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(rentId)) {
      return res.status(400).json({ message: "Invalid rent item ID" });
    }

    const deletedRent = await Rent.findByIdAndDelete(rentId);

    if (!deletedRent) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item rejected and removed", deletedRent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// rentController.js
const getRentItemsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId; // This is the Firebase UID
    
    // Find all rent items that belong to this user
    const rentItems = await Rent.find({ userId: userId });
    
    if (!rentItems || rentItems.length === 0) {
      return res.status(404).json({ message: "No items found for this user" });
    }

    res.status(200).json(rentItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve an item (Admin only)
const approveRentItem = async (req, res) => {
  try {
    const rentId = req.params.id;

    // Ensure the ID is valid
    if (!mongoose.Types.ObjectId.isValid(rentId)) {
      return res.status(400).json({ message: "Invalid rent item ID" });
    }

    const updatedRent = await Rent.findByIdAndUpdate(
      rentId,
      { adminVerified: true },
      { new: true }
    );

    if (!updatedRent) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item approved", updatedRent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRentItems,
  getAllItemsForAdmin,
  postRentItem,
  approveRentItem,
  getRentItemsByUserId,
  rejectRentItem,
  deleteRentItem,
  getRentItemById
};
