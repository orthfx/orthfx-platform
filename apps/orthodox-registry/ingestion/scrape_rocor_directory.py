#!/usr/bin/env python3
"""
ROCOR Parish Directory Scraper

Scrapes parish data from the St. Innocent Press ROCOR Parish Directory.
The directory appears to show a maintenance message on the homepage,
but the actual browse endpoints are functional.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time
from typing import List, Dict, Optional
from urllib.parse import urljoin

BASE_URL = "https://directory.stinnocentpress.com/"

# Headers to mimic a browser request
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
}

# Countries and states from the directory.js file
COUNTRIES_WITH_STATES = {
    'United States': ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
                      'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
                      'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
                      'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'PR',
                      'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
                      'WI', 'WY', 'AP'],
    'Canada': ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
    'Australia': ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'],
}

# Countries without state subdivisions
COUNTRIES_WITHOUT_STATES = [
    'Argentina', 'Austria', 'Belgium', 'Brazil', 'Chile', 'Costa Rica',
    'Denmark', 'Dominican Republic', 'France', 'Germany', 'Haiti', 'India',
    'Indonesia', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Luxembourg',
    'Mexico', 'Morocco', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
    'Pakistan', 'Paraguay', 'Philippines', 'Portugal', 'Russia', 'South Korea',
    'Spain', 'Switzerland', 'Tonga', 'Turkey', 'Uganda', 'United Kingdom',
    'Uruguay', 'Vanuatu', 'Venezuela'
]


def extract_parishes_from_page(html: str, country: str, state: Optional[str] = None) -> List[Dict]:
    """Extract parish data from the browse page HTML."""
    parishes = []

    # Extract parish markers from JavaScript
    marker_pattern = r'markers\[(\d+)\]\s*=\s*new google\.maps\.Marker\({position: new google\.maps\.LatLng\(([-\d.]+),\s*([-\d.]+)\)'
    info_pattern = r'infoWindows\[(\d+)\]\s*=\s*new google\.maps\.InfoWindow\({content:\s*"<small>([^<]+)<BR>([^<]*)<BR><A Href=\\"viewparish\.cgi\?Uid=(\d+)'

    markers = {}
    for match in re.finditer(marker_pattern, html):
        uid = match.group(1)
        lat = float(match.group(2))
        lon = float(match.group(3))
        markers[uid] = {'uid': uid, 'latitude': lat, 'longitude': lon, 'country': country, 'state': state}

    for match in re.finditer(info_pattern, html):
        uid = match.group(4)
        name = match.group(2).strip()
        city = match.group(3).strip().rstrip(',').strip()

        if uid in markers:
            markers[uid]['name'] = name
            markers[uid]['city'] = city
            parishes.append(markers[uid])

    return parishes


def get_parish_details(uid: str) -> Optional[Dict]:
    """Fetch detailed information for a specific parish."""
    url = f"{BASE_URL}viewparish.cgi?Uid={uid}&lang=en"

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        details = {'uid': uid, 'url': url}

        # Extract details from the page
        # This will need to be customized based on the actual page structure
        # For now, we'll return basic info

        return details
    except Exception as e:
        print(f"Error fetching details for parish {uid}: {e}")
        return None


def scrape_country_state(country: str, state: Optional[str] = None) -> List[Dict]:
    """Scrape parishes for a specific country/state combination."""
    if state:
        url = f"{BASE_URL}viewparish.cgi?action=browse&Country={country.replace(' ', '+')}&State={state}"
        location = f"{country} - {state}"
    else:
        url = f"{BASE_URL}viewparish.cgi?action=browse&Country={country.replace(' ', '+')}"
        location = country

    print(f"Scraping {location}...", end=' ')

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        parishes = extract_parishes_from_page(response.text, country, state)
        print(f"Found {len(parishes)} parishes")

        return parishes
    except Exception as e:
        print(f"Error: {e}")
        return []


def scrape_all_parishes() -> List[Dict]:
    """Scrape all parishes from the directory."""
    all_parishes = []
    total_locations = sum(len(states) for states in COUNTRIES_WITH_STATES.values()) + len(COUNTRIES_WITHOUT_STATES)
    current = 0

    # Scrape countries with states
    for country, states in COUNTRIES_WITH_STATES.items():
        for state in states:
            current += 1
            print(f"[{current}/{total_locations}] ", end='')
            parishes = scrape_country_state(country, state)
            all_parishes.extend(parishes)
            time.sleep(0.2)  # Be polite to the server

    # Scrape countries without states
    for country in COUNTRIES_WITHOUT_STATES:
        current += 1
        print(f"[{current}/{total_locations}] ", end='')
        parishes = scrape_country_state(country)
        all_parishes.extend(parishes)
        time.sleep(0.2)  # Be polite to the server

    return all_parishes


def save_to_json(parishes: List[Dict], filename: str = 'rocor_parishes.json'):
    """Save parishes to JSON file."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(parishes, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(parishes)} parishes to {filename}")


def save_to_csv(parishes: List[Dict], filename: str = 'rocor_parishes.csv'):
    """Save parishes to CSV file."""
    import csv

    if not parishes:
        print("No parishes to save")
        return

    # Get all unique keys
    fieldnames = ['uid', 'name', 'city', 'state', 'country', 'latitude', 'longitude', 'url']

    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()

        for parish in parishes:
            # Add detail URL
            parish['url'] = f"{BASE_URL}viewparish.cgi?Uid={parish['uid']}&lang=en"
            writer.writerow(parish)

    print(f"Saved {len(parishes)} parishes to {filename}")


def main():
    print("ROCOR Parish Directory Scraper")
    print("=" * 50)

    # Scrape all parishes
    parishes = scrape_all_parishes()

    # Remove duplicates (in case any parish appears in multiple locations)
    seen_uids = set()
    unique_parishes = []
    for parish in parishes:
        if parish['uid'] not in seen_uids:
            seen_uids.add(parish['uid'])
            unique_parishes.append(parish)

    print(f"\nTotal unique parishes found: {len(unique_parishes)}")

    # Save to both JSON and CSV
    save_to_json(unique_parishes)
    save_to_csv(unique_parishes)

    print("\nDone!")


if __name__ == '__main__':
    main()
