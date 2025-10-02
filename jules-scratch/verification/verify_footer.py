import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Set a large viewport for testing the desktop layout
    page.set_viewport_size({"width": 1280, "height": 800})

    # 1. Go to the homepage
    page.goto("http://localhost:5173/")

    # 2. Verify the footer
    # Wait for the footer to be visible, giving it a generous timeout
    footer = page.locator("footer")
    expect(footer).to_be_visible(timeout=15000)

    # Scroll the footer into view to ensure it's not off-screen
    footer.scroll_into_view_if_needed()

    # Assert that key contact information is present
    expect(footer).to_contain_text("09622146172")
    expect(footer).to_contain_text("kalyekart@gmail.com")

    # Assert that the QR code section is present
    expect(page.get_by_text("Scan to Visit")).to_be_visible()

    # Take a screenshot of the footer for visual verification
    footer.screenshot(path="jules-scratch/verification/footer_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)