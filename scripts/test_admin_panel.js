
import axios from "axios";

// This script verifies the Admin Panel API Endpoints
// It assumes the server is running (which might fail in this sandbox without MongoDB)
// But it provides the structure requested by the user.

const API_URL = "http://localhost:5080/api";

async function testAdminPanel() {
  console.log("Starting Admin Panel Tests...");

  try {
    // 1. Test Dashboard Summary (Analytics)
    // Note: This endpoint is protected. In a real scenario, we'd need to login as admin first.
    // For this test script, we will just ping it and expect a 401 (Unauthorized) which confirms the route exists.
    // If it returns 404, that's a failure.
    try {
      await axios.get(`${API_URL}/analytics/dashboard-summary`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("✓ /api/analytics/dashboard-summary exists (Unauthorized as expected)");
      } else if (error.response && error.response.status === 404) {
         console.error("✗ /api/analytics/dashboard-summary NOT FOUND");
      } else {
         console.log(`? /api/analytics/dashboard-summary returned ${error.response?.status}`);
      }
    }

    // 2. Test User Management Endpoint
    try {
      await axios.get(`${API_URL}/auth/users`);
    } catch (error) {
       if (error.response && error.response.status === 401) {
        console.log("✓ /api/auth/users exists (Unauthorized as expected)");
      } else {
         console.log(`? /api/auth/users returned ${error.response?.status}`);
      }
    }

    // 3. Test Products Endpoint (Public/Admin)
    try {
        const res = await axios.get(`${API_URL}/products`);
        if(res.status === 200) {
            console.log("✓ /api/products is accessible");
        }
    } catch (error) {
        console.error("✗ /api/products failed:", error.message);
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAdminPanel();
