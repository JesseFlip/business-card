from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Load the local index.html file
        filepath = os.path.abspath('index.html')
        page.goto(f"file://{filepath}")

        print("--- Verification Started ---")

        # Verify Title
        # Note: <title> tag text
        page_title = page.title()
        print(f"Page Title: {page_title}")

        # Verify Hero Role Text
        hero_text = page.locator('.text p').inner_text()
        print(f"Hero Role Text: {hero_text}")
        assert "Solutions Engineer" in hero_text
        assert "Bridging Enterprise Strategy" in hero_text

        # Verify Resume Button
        resume_btn = page.locator('.resume-btn')
        is_resume_visible = resume_btn.is_visible()
        print(f"Resume Button Visible: {is_resume_visible}")
        assert is_resume_visible
        assert "Download Resume (PDF)" in resume_btn.inner_text()

        # Verify Social Icons in Hero and Footer
        # .social-links class is used in Hero and Footer
        social_links_count = page.locator('.social-links a').count()
        print(f"Social Links in .social-links containers: {social_links_count}")
        # Expect 2 in Hero + 2 in Footer = 4
        assert social_links_count == 4

        # Verify Header Links
        header_email = page.locator('nav a[href^="mailto:"]')
        header_linkedin = page.locator('nav a[href*="linkedin.com"]')
        print(f"Header Email Link Visible: {header_email.is_visible()}")
        print(f"Header LinkedIn Link Visible: {header_linkedin.is_visible()}")
        assert header_email.is_visible()
        assert header_linkedin.is_visible()

        # Verify Skills Categories
        categories = page.locator('.skill-category h3').all_inner_texts()
        print(f"Skill Categories Found: {categories}")
        expected_cats = ["Languages & Logic", "Cloud & Infrastructure", "Business Intelligence", "Domain Expertise"]
        for cat in expected_cats:
            if cat not in categories:
                print(f"FAIL: Missing category {cat}")
            assert cat in categories

        # Verify Unit Converter Project
        converter_card = page.locator('.project-card', has_text="Universal Unit Converter")
        business_case = converter_card.locator("text=Business Case")
        is_biz_case_visible = business_case.is_visible()
        print(f"Business Case Section Visible: {is_biz_case_visible}")
        assert is_biz_case_visible

        # Verify Experience Bold Numbers
        # Check that we have <strong> tags in experience items
        bold_elements_count = page.locator('.experience-item strong').count()
        print(f"Count of bold elements in experience items: {bold_elements_count}")
        assert bold_elements_count > 0

        # Check "In Training" is gone
        # The specific phrase "Solutions Engineer in Training" should be gone
        content = page.content()
        if "Solutions Engineer in Training" in content:
             print("FAIL: 'Solutions Engineer in Training' still present")
             raise Exception("Text 'Solutions Engineer in Training' found")
        else:
             print("PASS: 'Solutions Engineer in Training' removed")

        browser.close()
        print("--- Verification Complete ---")

if __name__ == "__main__":
    run()
