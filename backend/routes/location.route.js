import express from "express";
import {
    getCebuCitiesAndMunicipalities,
    getBarangays,
    getCoordinates,
    calculateHaversineDistance,
    reverseGeocode
} from "../services/location.service.js";

const router = express.Router();

// Define the central warehouse coordinates for "Pungko-pungko sa salazar" (approximated to USC Main)
const WAREHOUSE_COORDINATES = { lat: 10.2983, lon: 123.8991 };

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
        if (!shippingAddress || !shippingAddress.barangay || !shippingAddress.city) {
            return res.status(400).json({ message: "City and barangay are required to calculate the delivery fee." });
        }

        const fullAddress = `${shippingAddress.barangay}, ${shippingAddress.city}, Cebu, Philippines`;
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

        // Updated fee model
        const baseFee = 15; // Base fare
        const feePerKm = 5;  // Per-km charge
        const deliveryFee = Math.round(baseFee + (distance * feePerKm));

        res.json({ deliveryFee, distance: distance.toFixed(2) });
    } catch (error) {
        res.status(500).json({ message: "Server error while calculating delivery fee." });
    }
});

router.post("/reverse-geocode", async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude are required." });
        }
        const address = await reverseGeocode(lat, lon);
        res.json(address);
    } catch (error) {
        res.status(500).json({ message: "Server error while reverse geocoding." });
    }
});

export default router;