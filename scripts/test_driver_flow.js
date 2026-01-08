
import axios from "axios";

// This script verifies the Driver Panel API Endpoints

const API_URL = "http://localhost:5080/api";

async function testDriverPanel() {
  console.log("Starting Driver Panel Tests...");

  try {
    // 1. Test Available Orders
    try {
      await axios.get(`${API_URL}/orders/available`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("✓ /api/orders/available exists (Unauthorized as expected)");
      } else {
         console.log(`? /api/orders/available returned ${error.response?.status || error.message}`);
      }
    }

    // 2. Test Active Orders
    try {
      await axios.get(`${API_URL}/orders/active`);
    } catch (error) {
       if (error.response && error.response.status === 401) {
        console.log("✓ /api/orders/active exists (Unauthorized as expected)");
      } else {
         console.log(`? /api/orders/active returned ${error.response?.status || error.message}`);
      }
    }

    // 3. Test Driver History
     try {
      await axios.get(`${API_URL}/orders/history`);
    } catch (error) {
       if (error.response && error.response.status === 401) {
        console.log("✓ /api/orders/history exists (Unauthorized as expected)");
      } else {
         console.log(`? /api/orders/history returned ${error.response?.status || error.message}`);
      }
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testDriverPanel();
