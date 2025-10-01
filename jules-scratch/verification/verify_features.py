import re
from playwright.sync_api import Page, expect

def login(page: Page, email: str, password: str):
    """Logs a user in."""
    page.goto("http://localhost:5173/login", wait_until="domcontentloaded")

    # Wait for the email field to be stable and ready for interaction
    email_input = page.get_by_label("Email address")
    expect(email_input).to_be_visible()
    expect(email_input).to_be_enabled()
    email_input.fill(email)

    # Wait for the password field to be stable
    password_input = page.get_by_label("Password")
    expect(password_input).to_be_visible()
    expect(password_input).to_be_enabled()
    password_input.fill(password)

    # Click the login button and wait for navigation to complete
    login_button = page.get_by_role("button", name="Login")
    login_button.click()

    # Wait for a unique element on the homepage to confirm login was successful
    expect(page.get_by_role("heading", name="Featured Products")).to_be_visible(timeout=10000)

def test_customer_features(page: Page):
    """Tests the customer-facing features."""
    print("--- Testing Customer Features ---")
    login(page, "customer@kalyekart.app", "password123")

    # Navigate to the profile page and verify new components
    print("Navigating to profile page...")
    page.goto("http://localhost:5173/my-profile", wait_until="domcontentloaded")

    expect(page.get_by_role("heading", name="Manage Delivery Addresses")).to_be_visible()
    print("Verified: Delivery Address Manager is visible.")

    expect(page.get_by_role("heading", name="Recent Orders")).to_be_visible()
    print("Verified: Recent Orders section is visible.")

    page.screenshot(path="jules-scratch/verification/customer_profile_page.png")
    print("Screenshot taken: customer_profile_page.png")

    # Navigate to the first product on the homepage to check comments
    print("Navigating to product page...")
    page.goto("http://localhost:5173/", wait_until="domcontentloaded")

    # Find the first product link and click it
    first_product_link = page.get_by_role("link", name=re.compile(r"View Details")).first
    expect(first_product_link).to_be_visible()
    product_name = first_product_link.get_attribute("aria-label").replace("View Details for ", "")
    print(f"Navigating to product: {product_name}")
    first_product_link.click()

    # Wait for the reviews section to be loaded
    expect(page.get_by_role("heading", name="Customer Reviews")).to_be_visible(timeout=10000)
    print("Verified: Customer Reviews section is visible.")

    page.screenshot(path="jules-scratch/verification/product_comments.png")
    print("Screenshot taken: product_comments.png")

def test_admin_features(page: Page):
    """Tests the admin-facing features."""
    print("\n--- Testing Admin Features ---")
    login(page, "admin@kalyekart.app", "password123")

    # Navigate to the admin dashboard
    print("Navigating to admin dashboard...")
    page.goto("http://localhost:5173/secret-dashboard", wait_until="domcontentloaded")

    # Verify quick stats are present
    expect(page.get_by_role("heading", name="Quick Stats")).to_be_visible()
    print("Verified: Quick Stats section is visible.")

    expect(page.get_by_text("Total Revenue")).to_be_visible()
    print("Verified: Total Revenue stat is visible.")

    page.screenshot(path="jules-scratch/verification/admin_dashboard.png")
    print("Screenshot taken: admin_dashboard.png")

def run_all_tests(page: Page):
    """Runs all verification tests."""
    try:
        test_customer_features(page)
    except Exception as e:
        print(f"\n[ERROR] Customer feature verification failed: {e}")
        page.screenshot(path="jules-scratch/verification/customer_features_error.png")

    try:
        test_admin_features(page)
    except Exception as e:
        print(f"\n[ERROR] Admin feature verification failed: {e}")
        page.screenshot(path="jules-scratch/verification/admin_features_error.png")

if __name__ == "__main__":
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_all_tests(page)
        browser.close()
    print("\nVerification script finished.")