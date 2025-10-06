from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Sign up a new user
        page.goto("http://localhost:5173/signup")
        page.fill("#name", "Jules Test User")
        page.fill("#email", f"jules.test.{int(time.time())}@example.com")
        page.fill("#password", "password123")
        page.click("button[type=submit]")

        # Wait for successful signup and redirection to login page
        expect(page).to_have_url("http://localhost:5173/login")

        # Log in with the new user
        page.fill("#email", f"jules.test.{int(time.time())}@example.com")
        page.fill("#password", "password123")
        page.click("button[type=submit]")

        # Wait for successful login and redirection to the homepage
        expect(page).to_have_url("http://localhost:5173/")

        # Add an item to the cart
        # Click the first product card to go to product details
        page.locator(".product-card").first.click()
        expect(page).to_have_url(lambda url: "/product/" in url)

        # Click "Add to Cart"
        page.locator("button:has-text('Add To Cart')").click()
        toast_visible = expect(page.locator("text=Product added to cart")).to_be_visible()

        # Go to the checkout page
        page.goto("http://localhost:5173/checkout")
        page.wait_for_selector("text=Payment Method")

        # Fill out delivery information
        page.fill("#fullName", "Jules Test User")
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
        print("Successfully verified the checkout page.")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/verification/final-checkout-error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)