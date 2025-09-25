import express from "express";
import {
  getCebuCities,
  getCebuMunicipalities,
  getBarangays,
} from "../services/psgc.service.js";
import {
  getCoordinates,
  calculateDistance,
} from "../services/location.service.js";

const router = express.Router();

const WAREHOUSE_COORDINATES = {
  lat: 10.3157,
  lon: 123.8854,
}; // Cebu City coordinates

router.get("/cities", async (req, res) => {
  try {
    const cities = await getCebuCities();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/municipalities", async (req, res) => {
  try {
    const municipalities = await getCebuMunicipalities();
    res.json(municipalities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/barangays/:cityOrMunicipalityCode", async (req, res) => {
  try {
    const { cityOrMunicipalityCode } = req.params;
    const barangays = await getBarangays(cityOrMunicipalityCode);
    res.json(barangays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/delivery-fee", async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const address = `${shippingAddress.street}, ${shippingAddress.barangay}, ${shippingAddress.city}, Cebu`;
    const coordinates = await getCoordinates(address);
    if (!coordinates) {
      return res.status(400).json({ message: "Could not find location" });
    }

    const distance = calculateDistance(
      WAREHOUSE_COORDINATES.lat,
      WAREHOUSE_COORDINATES.lon,
      coordinates.lat,
      coordinates.lon
    );

    const baseFee = 50;
    const feePerKm = 10;
    const deliveryFee = baseFee + distance * feePerKm;

    res.json({ deliveryFee, distance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;