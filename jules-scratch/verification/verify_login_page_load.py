from playwright.sync_api import sync_playwright

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for console messages
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

    try:
        print("Navigating to login page...")
        page.goto("http://localhost:5173/login", timeout=60000)
        print("Page loaded. Taking screenshot...")
        page.screenshot(path="jules-scratch/verification/login_page_debug.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)