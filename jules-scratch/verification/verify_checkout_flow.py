from playwright.sync_api import sync_playwright, expect
import time

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Login
        page.goto("http://localhost:5174/login")
        page.get_by_label("Email address").fill("testuser@gmail.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to home page
        expect(page.get_by_role("button", name="All")).to_be_visible(timeout=10000)
        print("Login successful")

        # 2. Add item to cart from home page
        page.locator(".group").first.click()

        # Wait for product detail page to load
        expect(page.get_by_role("button", name="Add to Cart")).to_be_visible()
        page.get_by_role("button", name="Add to Cart").click()
        print("Added item to cart")

        # Wait for toast message to show and hide
        time.sleep(2)

        # 3. Go to checkout
        page.goto("http://localhost:5174/checkout")
        print("Navigated to checkout")

        # 4. Verify payment methods
        expect(page.get_by_role("heading", name="Payment Method")).to_be_visible(timeout=10000)
        print("Payment methods visible")

        # Take a screenshot of the initial state of payment methods
        page.screenshot(path="jules-scratch/verification/checkout_page_initial.png")
        print("Took initial screenshot")

        # Select the Cash on Delivery payment method.
        cod_button = page.get_by_text("Cash on Delivery")
        cod_button.click()
        print("Clicked COD")

        # Wait for the animation to start
        time.sleep(1)

        # Take a screenshot of the animated truck
        page.screenshot(path="jules-scratch/verification/checkout_page_cod_selected.png")
        print("Took COD screenshot")

        # Select the GCash payment method
        gcash_button = page.locator('button:has(img[alt="GCash"])')
        gcash_button.click()
        print("Clicked GCash")
        time.sleep(1)

        # Take a screenshot of the GCash payment method selected
        page.screenshot(path="jules-scratch/verification/checkout_page_gcash_selected.png")
        print("Took GCash screenshot")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)