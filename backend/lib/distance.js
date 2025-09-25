const cebuMunicipalities = {
    "Alcantara": 78.9,
    "Alcoy": 105.1,
    "Alegria": 118.9,
    "Aloguinsan": 59.5,
    "Argao": 66.8,
    "Asturias": 50.5,
    "Badian": 97.6,
    "Balamban": 42.1,
    "Bantayan": 136.2,
    "Barili": 61.5,
    "Bogo City": 101.5,
    "Boljoon": 103.2,
    "Borbon": 83.2,
    "Carcar City": 40.3,
    "Carmen": 41.6,
    "Catmon": 57.3,
    "Cebu City": 0,
    "Compostela": 32.8,
    "Consolacion": 13.5,
    "Cordova": 23.3,
    "Daanbantayan": 129.8,
    "Dalaguete": 84.8,
    "Danao City": 33.2,
    "Dumanjug": 73.5,
    "Ginatilan": 135.5,
    "Lapu-Lapu City": 15.9,
    "Liloan": 19.3,
    "Madridejos": 146.7,
    "Malabuyoc": 126.2,
    "Mandaue City": 6.8,
    "Medellin": 119.5,
    "Minglanilla": 15.5,
    "Moalboal": 89.2,
    "Naga City": 21.1,
    "Oslob": 117.4,
    "Pilar": 145.1,
    "Pinamungajan": 64.9,
    "Poro": 129.3,
    "Ronda": 81.3,
    "Samboan": 149.9,
    "San Fernando": 29.1,
    "San Francisco": 118.6,
    "San Remigio": 109.1,
    "Santa Fe": 138.8,
    "Santander": 133.5,
    "Sibonga": 50.6,
    "Sogod": 61.2,
    "Tabogon": 91.2,
    "Tabuelan": 90.1,
    "Talisay City": 11.9,
    "Toledo City": 50.1,
    "Tuburan": 95.8,
    "Tudela": 136.5,
};

export const getDeliveryDetails = (city) => {
    const distance = cebuMunicipalities[city];
    if (distance === undefined) {
        // Return a default fee for unknown locations or handle as an error
        return { distance: 0, deliveryFee: 50 };
    }

    const baseFee = 50;
    const feePerKm = 10;
    const deliveryFee = baseFee + (distance * feePerKm);

    return { distance, deliveryFee };
};