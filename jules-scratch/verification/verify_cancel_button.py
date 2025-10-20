
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:5173/admin/discounts")

        # Wait for the table to load
        page.wait_for_selector('table')

        # Click the first delete button
        page.click('button:has-text("Delete")')

        # Wait for the modal to appear
        page.wait_for_selector('text="Are you sure you want to delete the discount"')

        # Click the cancel button
        page.click('button:has-text("Cancel")')

        # Wait for the modal to disappear
        page.wait_for_selector('text="Are you sure you want to delete the discount"', state='hidden')

        page.screenshot(path="jules-scratch/verification/verification.png")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
