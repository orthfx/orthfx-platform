#!/usr/bin/env python3
"""
Enhanced ROCOR Parish Detail Scraper

Scrapes detailed information for each parish from their individual pages.
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from typing import Dict, Optional

BASE_URL = "https://directory.stinnocentpress.com/"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}


def clean_text(text):
    """Clean and normalize text."""
    if not text:
        return None
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)
    return text if text else None


def extract_parish_details(uid: str) -> Optional[Dict]:
    """Scrape detailed information for a specific parish."""
    url = f"{BASE_URL}viewparish.cgi?Uid={uid}&lang=en"

    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        details = {'uid': uid, 'detail_url': url}

        # Extract parish title and organization
        title_elem = soup.find('span', class_='parish-title')
        if title_elem:
            title_text = clean_text(title_elem.get_text())
            details['full_title'] = title_text

        # Extract founded date
        founded_elem = soup.find('p', string=re.compile(r'Founded:'))
        if founded_elem:
            founded_text = clean_text(founded_elem.get_text())
            if founded_text and ':' in founded_text:
                details['founded'] = clean_text(founded_text.split(':', 1)[1])

        # Extract organization/diocese info
        org_pattern = re.compile(r'(Diocese|Stavropegial|Deanery|Mission)')
        org_elems = soup.find_all('p', string=org_pattern)
        if org_elems:
            orgs = [clean_text(elem.get_text()) for elem in org_elems if clean_text(elem.get_text())]
            if orgs:
                details['organization'] = orgs[0]

        # Find all blueboxes for detailed sections
        blueboxes = soup.find_all('div', class_='bluebox')

        for box in blueboxes:
            h2 = box.find('h2')
            if not h2:
                continue

            section_name = clean_text(h2.get_text()).lower()

            # Physical address
            if 'physical address' in section_name:
                paragraphs = box.find_all('p')
                address_lines = []
                for p in paragraphs:
                    if 'edit' not in p.get_text().lower():
                        line = clean_text(p.get_text())
                        if line:
                            address_lines.append(line)
                if address_lines:
                    details['physical_address'] = {
                        'full': '\n'.join(address_lines),
                        'lines': address_lines
                    }

            # Mailing address
            elif 'mailing address' in section_name:
                paragraphs = box.find_all('p')
                address_lines = []
                for p in paragraphs:
                    if 'edit' not in p.get_text().lower():
                        line = clean_text(p.get_text())
                        if line:
                            address_lines.append(line)
                if address_lines:
                    details['mailing_address'] = {
                        'full': '\n'.join(address_lines),
                        'lines': address_lines
                    }

            # Contact info
            elif 'contact info' in section_name:
                contact = {}
                paragraphs = box.find_all('p')
                for p in paragraphs:
                    text = p.get_text()
                    if 'edit' in text.lower():
                        continue

                    if 'Parish Phone:' in text:
                        phone = clean_text(text.split(':', 1)[1])
                        if phone:
                            contact['phone'] = phone
                    elif 'Alternate phone:' in text:
                        alt_phone = clean_text(text.split(':', 1)[1])
                        if alt_phone:
                            contact['alternate_phone'] = alt_phone
                    elif 'Fax:' in text:
                        fax = clean_text(text.split(':', 1)[1])
                        if fax:
                            contact['fax'] = fax
                    elif 'E-mail:' in text:
                        email = clean_text(text.split(':', 1)[1])
                        if email:
                            contact['email'] = email
                    elif 'Website:' in text:
                        link = p.find('a')
                        if link and link.get('href'):
                            website = clean_text(link.get('href'))
                            if website:
                                contact['website'] = website

                if contact:
                    details['contact'] = contact

            # Clergy
            elif 'clergy' in section_name:
                clergy_list = []
                paragraphs = box.find_all('p')
                for p in paragraphs:
                    if 'edit' in p.get_text().lower():
                        continue

                    link = p.find('a')
                    if link:
                        clergy_name = clean_text(link.get_text())
                        clergy_uid = None
                        href = link.get('href', '')
                        uid_match = re.search(r'Uid=(\d+)', href)
                        if uid_match:
                            clergy_uid = uid_match.group(1)

                        # Extract title/role after the link
                        full_text = clean_text(p.get_text())
                        role = None
                        if ',' in full_text:
                            role = clean_text(full_text.split(',', 1)[1])

                        clergy_info = {
                            'name': clergy_name,
                            'uid': clergy_uid,
                        }
                        if role:
                            clergy_info['role'] = role

                        clergy_list.append(clergy_info)

                if clergy_list:
                    details['clergy'] = clergy_list

            # Additional information
            elif 'additional information' in section_name:
                paragraphs = box.find_all('p')
                additional = {}
                for p in paragraphs:
                    text = p.get_text()
                    if 'edit' in text.lower():
                        continue

                    if 'Service language' in text:
                        lang_text = clean_text(text)
                        if ':' in lang_text:
                            languages = clean_text(lang_text.split(':', 1)[1])
                            if languages:
                                additional['service_languages'] = languages
                    else:
                        # Other additional info
                        line = clean_text(text)
                        if line and 'additional' not in additional:
                            additional['notes'] = line

                if additional:
                    details['additional_info'] = additional

        # Extract photo URL
        photo_img = soup.find('img', src=re.compile(r'photos/\d+\.jpg'))
        if photo_img:
            photo_url = photo_img.get('src')
            if photo_url and not photo_url.startswith('http'):
                photo_url = BASE_URL + photo_url.lstrip('/')
            details['photo_url'] = photo_url

        # Extract last updated date
        last_updated = soup.find('p', string=re.compile(r'Last updated:'))
        if last_updated:
            updated_text = clean_text(last_updated.get_text())
            if updated_text and ':' in updated_text:
                date_str = clean_text(updated_text.split(':', 1)[1])
                if date_str:
                    details['last_updated'] = date_str

        return details

    except Exception as e:
        print(f"Error scraping parish {uid}: {e}")
        return None


def enhance_parish_data():
    """Load existing parish data and enhance it with detailed information."""

    # Load existing parish data
    print("Loading existing parish data...")
    with open('rocor_parishes.json', 'r', encoding='utf-8') as f:
        parishes = json.load(f)

    print(f"Loaded {len(parishes)} parishes")
    print("Fetching detailed information for each parish...")
    print("This will take a while (about 2-3 minutes for all parishes)...\n")

    enhanced_parishes = []
    errors = []

    for i, parish in enumerate(parishes, 1):
        uid = parish['uid']
        print(f"[{i}/{len(parishes)}] Fetching details for parish {uid} ({parish['name']})...", end=' ')

        details = extract_parish_details(uid)

        if details:
            # Merge basic info with detailed info
            enhanced = {**parish, **details}
            enhanced_parishes.append(enhanced)
            print("✓")
        else:
            # Keep basic info even if details failed
            enhanced_parishes.append(parish)
            errors.append(uid)
            print("✗")

        # Be polite to the server
        time.sleep(0.3)

    print(f"\n\nCompleted!")
    print(f"Successfully enhanced: {len(enhanced_parishes) - len(errors)} parishes")
    print(f"Failed to enhance: {len(errors)} parishes")

    if errors:
        print(f"Failed UIDs: {', '.join(errors)}")

    # Save enhanced data
    print("\nSaving enhanced data...")
    with open('rocor_parishes_detailed.json', 'w', encoding='utf-8') as f:
        json.dump(enhanced_parishes, f, indent=2, ensure_ascii=False)

    print(f"Saved to rocor_parishes_detailed.json")

    # Print sample of enhanced data
    print("\n" + "="*60)
    print("Sample enhanced parish data:")
    print("="*60)
    if enhanced_parishes:
        sample = enhanced_parishes[0]
        print(json.dumps(sample, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    enhance_parish_data()
