from playwright.sync_api import Page, expect

def debug_login_page(page: Page):
    print("--- Debugging Login Page ---")
    try:
        page.goto("http://localhost:5173/login", wait_until="networkidle")
        print("Successfully navigated to /login.")
        page.screenshot(path="jules-scratch/verification/login_page_debug.png")
        print("Screenshot 'login_page_debug.png' captured.")

        # Also, let's capture the page content
        content = page.content()
        with open("jules-scratch/verification/login_page_content.html", "w") as f:
            f.write(content)
        print("HTML content of the login page saved to 'login_page_content.html'.")

    except Exception as e:
        print(f"[ERROR] Could not load or screenshot the login page: {e}")

if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        debug_login_page(page)
        browser.close()
    print("\nDebug script finished.")