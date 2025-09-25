import express from "express";
import {
    getCebuCitiesAndMunicipalities,
    getBarangays,
    getCoordinates,
    calculateHaversineDistance
} from "../services/location.service.js";

const router = express.Router();

// Define the central warehouse coordinates
const WAREHOUSE_COORDINATES = { lat: 10.3157, lon: 123.8854 }; // Cebu City

router.get("/cities-municipalities", async (req, res) => {
    try {
        const locations = await getCebuCitiesAndMunicipalities();
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch locations." });
    }
});

router.get("/barangays/:cityOrMunCode", async (req, res) => {
    try {
        const { cityOrMunCode } = req.params;
        const barangays = await getBarangays(cityOrMunCode);
        res.json(barangays);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch barangays." });
    }
});

router.post("/calculate-fee", async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.barangay || !shippingAddress.city) {
            return res.status(400).json({ message: "A complete address is required to calculate the delivery fee." });
        }

        const fullAddress = `${shippingAddress.street}, ${shippingAddress.barangay}, ${shippingAddress.city}, Cebu, Philippines`;
        const coordinates = await getCoordinates(fullAddress);

        if (!coordinates) {
            return res.status(404).json({ message: "Could not determine coordinates for the provided address." });
        }

        const distance = calculateHaversineDistance(
            WAREHOUSE_COORDINATES.lat,
            WAREHOUSE_COORDINATES.lon,
            coordinates.lat,
            coordinates.lon
        );

        // Fairer fee model
        const baseFee = 20; // Lower base fee
        const feePerKm = 8;  // Lower per-km charge
        const deliveryFee = Math.round(baseFee + (distance * feePerKm));

        res.json({ deliveryFee, distance: distance.toFixed(2) });
    } catch (error) {
        res.status(500).json({ message: "Server error while calculating delivery fee." });
    }
});

export default router;