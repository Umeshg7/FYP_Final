const Rent = require("../models/Rent");
const mongoose = require("mongoose");

// Get all approved rent items
const getAllRentItems = async (req, res) => {
    try {
      const rents = await Rent.find({ adminVerified: true }); // Only approved items
      res.status(200).json(rents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
// Get all items (for admin)
const getAllItemsForAdmin = async (req, res) => {
  try {
    const rents = await Rent.find({}); // Fetch all items (approved + pending)
    res.status(200).json(rents);
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
    const deletedRent = await Rent.findByIdAndDelete(rentId);

    if (!deletedRent) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item rejected and removed", deletedRent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Approve an item (Admin only)
const approveRentItem = async (req, res) => {
  try {
    const rentId = req.params.id;
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
  rejectRentItem
};
