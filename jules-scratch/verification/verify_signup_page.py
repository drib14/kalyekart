from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        print("Navigating to signup page...")
        page.goto("http://localhost:5173/signup", timeout=60000) # Increased timeout
        print("Taking screenshot...")
        page.screenshot(path="jules-scratch/verification/signup-page-screenshot.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/verification/signup-page-error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)