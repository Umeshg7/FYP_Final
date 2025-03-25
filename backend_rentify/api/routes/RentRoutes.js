const express = require("express");
const router = express.Router();
const rentController = require("../controllers/rentControllers");

// Get only approved rent items (For users)
router.get("/", rentController.getAllRentItems);

// Get all rent items (For admin panel)
router.get("/admin", rentController.getAllItemsForAdmin);

// Post a new rent item (Users can submit)
router.post("/", rentController.postRentItem);

// Approve a rent item (Admin only)
router.patch("/approve/:id", rentController.approveRentItem);

router.delete("/reject/:id", rentController.rejectRentItem);


module.exports = router;
