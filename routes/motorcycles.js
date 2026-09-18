const express = require("express");
const router = express.Router();
const Motorcycle = require("../models/Motorcycle");

// Get All Motorcycles
router.get("/", async (req, res) => {
  try {
    const motorcycles = await Motorcycle.find();
    res.json(motorcycles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Motorcycle
router.post("/", async (req, res) => {
  try {
    const motorcycle = new Motorcycle(req.body);
    const savedMotorcycle = await motorcycle.save();
    res.status(201).json(savedMotorcycle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get Single Motorcycle
router.get("/:id", async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findById(req.params.id);
    res.json(motorcycle);
  } catch (error) {
    res.status(404).json({ message: "Motorcycle not found" });
  }
});

// Update Motorcycle
router.put("/:id", async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(motorcycle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Motorcycle
router.delete("/:id", async (req, res) => {
  try {
    await Motorcycle.findByIdAndDelete(req.params.id);
    res.json({ message: "Motorcycle Deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;