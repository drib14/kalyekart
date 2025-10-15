from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:5173/login")
    page.get_by_label("Email").fill("testuser@gmail.com")
    page.get_by_label("Password").fill("123456")
    page.get_by_role("button", name="Login").click()

    # Wait for navigation to complete
    expect(page).to_have_url("http://localhost:5173/")

    # Go to the first product and favorite it
    page.locator(".relative.mx-3.mt-3.flex.h-60.overflow-hidden.rounded-xl").first.click()
    expect(page).to_have_url(lambda url: "http://localhost:5173/product/" in url)
    page.locator("button.absolute.top-2.right-2.rounded-full.p-2.bg-white\\/80.hover\\:bg-white").click()


    # Go to favorites page
    page.goto("http://localhost:5173/favorites")
    expect(page).to_have_url("http://localhost:5173/favorites")

    # Verify that the favorited product is there
    expect(page.locator(".relative.mx-3.mt-3.flex.h-60.overflow-hidden.rounded-xl")).to_be_visible()

    page.screenshot(path="jules-scratch/verification/favorites.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)