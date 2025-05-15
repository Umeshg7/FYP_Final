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

const postRentItem = async (req, res) => {
  try {
    const { longitude, latitude, address, ...rest } = req.body;

    if (!longitude || !latitude) {
      console.error("Missing longitude or latitude:", { longitude, latitude });
      return res.status(400).json({ message: "Longitude and latitude are required." });
    }

    const newRentItem = new Rent({
      ...rest,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || ""
      }
    });

    const savedRentItem = await newRentItem.save();
    res.status(201).json(savedRentItem);
  } catch (error) {
    console.error("Error saving rent item:", error);
    res.status(500).json({ message: "Error saving item." });
  }
};



const getRentItemsNearby = async (req, res) => {
  const { lng, lat, radius = 10000 } = req.query;  // Default 10km radius

  try {
    const rents = await Rent.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      },
      adminVerified: true
    });
    res.status(200).json(rents);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

const searchSuggestions = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    
    if (!searchTerm || searchTerm.length < 3) {
      return res.status(400).json({ message: "Search term must be at least 3 characters" });
    }

    const results = await Rent.aggregate([
      {
        $match: {
          $and: [
            { adminVerified: true },
            {
              $or: [
                { title: { $regex: searchTerm, $options: "i" } },
                { category: { $regex: searchTerm, $options: "i" } }
              ]
            }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          score: {
            $cond: [
              { $regexMatch: { input: "$title", regex: searchTerm, options: "i" } },
              2, // Higher score for title matches
              1  // Lower score for category matches
            ]
          }
        }
      },
      { $sort: { score: -1, title: 1 } }, // Sort by score then alphabetically
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          name: "$title", // Standardize as "name" for frontend
          type: { $literal: "item" } // Optional: add type for future flexibility
        }
      }
    ]);

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update a rent item
const updateRentItem = async (req, res) => {
  try {
    const rentId = req.params.id;
    const updates = req.body;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(rentId)) {
      return res.status(400).json({ message: "Invalid rent item ID" });
    }

    // Handle location updates if provided
    if (updates.longitude || updates.latitude) {
      updates.location = {
        type: "Point",
        coordinates: [
          parseFloat(updates.longitude || 0),
          parseFloat(updates.latitude || 0)
        ],
        address: updates.address || ""
      };
      
      // Remove the individual fields to avoid duplicate data
      delete updates.longitude;
      delete updates.latitude;
      delete updates.address;
    }

    // Find and update the item
    const updatedItem = await Rent.findByIdAndUpdate(
      rentId,
      { 
        ...updates,
        adminVerified: false // Reset verification status on update
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      message: "Item updated successfully. Requires admin re-verification.",
      updatedItem
    });
  } catch (error) {
    console.error("Error updating rent item:", error);
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
  getRentItemById,
  getRentItemsNearby,
  searchSuggestions,
  updateRentItem
};
