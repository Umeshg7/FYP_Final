const express = require("express");
const router = express.Router();
const rentController = require("../controllers/rentControllers");

// Get only approved rent items (For users)
router.get("/", rentController.getAllRentItems);

// Get all rent items (For admin panel)
router.get("/admin", rentController.getAllItemsForAdmin);

// Get a single rent item by ID (Fix)
router.get("/item/:id", rentController.getRentItemById);

// Post a new rent item (Users can submit)
router.post("/", rentController.postRentItem);

// Approve a rent item (Admin only)
router.patch("/approve/:id", rentController.approveRentItem);

// Reject a rent item (Admin only)
router.delete("/reject/:id", rentController.rejectRentItem);

// Delete a rent item
router.delete("/:id", rentController.deleteRentItem);

module.exports = router;
