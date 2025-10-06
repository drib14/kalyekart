from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the checkout page
        page.goto("http://localhost:5173/checkout")

        # Wait for the page to load and payment options to be visible
        expect(page.get_by_text("Payment Method")).to_be_visible()

        # Take a screenshot of the initial state of payment methods
        page.screenshot(path="jules-scratch/verification/checkout_page_initial.png")

        # Select the Cash on Delivery payment method
        cod_button = page.get_by_role("button", name="Cash on Delivery")
        cod_button.click()

        # Wait for the animation to be visible
        page.wait_for_timeout(500) # Give time for the animation to start

        # Take a screenshot of the animated truck
        page.screenshot(path="jules-scratch/verification/checkout_page_cod_selected.png")

        # Select the GCash payment method
        gcash_button = page.get_by_role("button", name="GCash")
        gcash_button.click()

        # Take a screenshot of the GCash payment method selected
        page.screenshot(path="jules-scratch/verification/checkout_page_gcash_selected.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)