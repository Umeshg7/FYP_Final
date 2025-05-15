const express = require("express");
const router = express.Router();
const rentController = require("../controllers/rentControllers");

// Get only approved rent items (For users)
router.get("/", rentController.getAllRentItems);

// Get all rent items (For admin panel)
router.get("/admin", rentController.getAllItemsForAdmin);

// Get a single rent item by ID (Fix)
router.get("/item/:id", rentController.getRentItemById);

// Get rent items by user ID
router.get("/user/:userId", rentController.getRentItemsByUserId);
// Post a new rent item (Users can submit)
router.post("/", rentController.postRentItem);

// Approve a rent item (Admin only)
router.patch("/approve/:id", rentController.approveRentItem);

// Reject a rent item (Admin only)
router.delete("/reject/:id", rentController.rejectRentItem);

// Delete a rent item
router.delete("/:id", rentController.deleteRentItem);

router.get("/nearby", rentController.getRentItemsNearby);


router.get("/search-suggestions", rentController.searchSuggestions);


// Update a rent item
router.put("/:id", rentController.updateRentItem);

module.exports = router;
