from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to the login page to set up the user
        page.goto("http://localhost:5173/login")

        # Use localStorage to simulate a user login
        page.evaluate("""
            localStorage.setItem('user-storage', JSON.stringify({
                state: {
                    user: {
                        _id: "testuser",
                        name: "Test User",
                        email: "test@example.com",
                        role: "customer"
                    }
                }
            }))
        """)

        # Navigate to the home page
        page.goto("http://localhost:5173/")

        # 1. Verify Desktop View
        page.set_viewport_size({"width": 1280, "height": 720})
        expect(page.get_by_role("button", name="NotificationBell")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/desktop_view.png")
        print("Screenshot for desktop view taken successfully.")

        # 2. Verify Mobile View
        page.set_viewport_size({"width": 375, "height": 667})
        expect(page.get_by_role("navigation")).to_be_visible() # The bottom nav is a <nav> element
        page.screenshot(path="jules-scratch/verification/mobile_view.png")
        print("Screenshot for mobile view taken successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/ui_redesign_error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)