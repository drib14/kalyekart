from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:5173/checkout")
    page.wait_for_selector("text=Payment Method")
    page.screenshot(path="jules-scratch/verification/checkout-page.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)