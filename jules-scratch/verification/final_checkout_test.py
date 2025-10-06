from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to the checkout page
        page.goto("http://localhost:5173/checkout")
        page.wait_for_selector("text=Payment Method")

        # Fill out delivery information
        page.fill("#fullName", "Jules Tester")
        page.fill("#contactNumber", "09123456789")
        page.select_option("#city", "Cebu City")
        page.wait_for_selector("#barangay > option:nth-child(2)")
        page.select_option("#barangay", "Talamban")
        page.fill("#sitio", "Test Street")

        # Test COD
        page.click("text=Cash on Delivery")
        expect(page.locator("button[type=submit]")).to_have_text("Place Order")

        # Test PayMongo Card
        page.click("text=Credit/Debit Card")
        expect(page.locator("button[type=submit]")).to_have_text("Proceed to Payment")

        # Capture a screenshot of the final state
        page.screenshot(path="jules-scratch/verification/final-checkout-verification.png")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/verification/final-checkout-error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)