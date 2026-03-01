import requests
from bs4 import BeautifulSoup
import time
from datetime import datetime
from pymongo import MongoClient

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def setup_mongodb():
    """Connects to MongoDB and returns the collection to store the data."""
    client = MongoClient('mongodb://localhost:27017/')
    db = client['scraper_db']
    collection = db['course_offerings']
    return collection

def sanitize_header(text, index):
    """
    Cleans header text to make it safe for MongoDB keys.
    Removes periods and dollar signs, replaces spaces with underscores.
    """
    clean_text = text.strip().replace('.', '').replace('$', '').replace(' ', '_')
    return clean_text if clean_text else f"empty_header_{index}"

def scrape_first_table_to_dicts(url):
    """
    Fetches the first table, extracts dynamic keys from the header row, 
    and applies specific letter-checking logic based on the column index.
    """
    print(f"\nFetching table from: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"  -> Error fetching this page: {e}")
        return None

    soup = BeautifulSoup(response.content, 'html.parser')
    table = soup.find('table')
    
    if not table:
        print("  -> No table found on this page.")
        return None

    rows = table.find_all('tr')
    
    if len(rows) < 2:
        print("  -> Table does not have enough rows.")
        return None

    # Extract and sanitize the first row for our keys
    header_cells = rows[0].find_all(['th', 'td'])
    table_keys = [sanitize_header(cell.get_text(strip=True), i) for i, cell in enumerate(header_cells)]
    
    table_documents = []

    # Iterate through the remaining data rows
    for row in rows[1:]:
        cells = row.find_all(['th', 'td'])
        
        if cells:
            row_dict = {}
            
            for i, cell in enumerate(cells):
                cell_text = cell.get_text(strip=True)
                has_letters = any(char.isalpha() for char in cell_text)
                
                # Split logic based on column index
                if i < 2:
                    # Columns 0 and 1 (Department, Course): Keep string or 0
                    processed_value = cell_text if has_letters else 0
                else:
                    # Columns 2+ (Availability): Store 1 or 0
                    processed_value = 1 if has_letters else 0
                
                # Map the processed value to the corresponding header key
                key_name = table_keys[i] if i < len(table_keys) else f"extra_column_{i}"
                row_dict[key_name] = processed_value
            
            print(f"    Scraped row: {row_dict}")
            table_documents.append(row_dict)

    return table_documents

# --- Example Usage ---
if __name__ == "__main__":
    # Add all the specific URLs you want to scrape here
    TARGET_URLS = [
        "https://www.seasoasa.ucla.edu/engr-courses/",
        "https://www.seasoasa.ucla.edu/?page_id=239365&preview=true",
        "https://www.seasoasa.ucla.edu/course-term-offerings/",
        "https://www.seasoasa.ucla.edu/civil-term-offerings/",
        "https://www.seasoasa.ucla.edu/cs-tentative-offerings/",
        "https://www.seasoasa.ucla.edu/ee-course-term-offerings/",
        "https://www.seasoasa.ucla.edu/materials-science-and-engineering-course-offerings/",
        "https://www.seasoasa.ucla.edu/mae-course-term-offerings/"
    ]
            
    db_collection = setup_mongodb()
    
    print(f"Starting scrape for {len(TARGET_URLS)} hardcoded URLs...")
    
    for link in TARGET_URLS:
        # Basic validation to ensure the URL is properly formatted
        if not link.startswith(('http://', 'https://')):
             link = 'https://' + link
             
        time.sleep(1) # Be polite to the server
        
        table_records = scrape_first_table_to_dicts(link)
        
        if table_records:
            page_document = {
                "source_url": link,
                "scraped_at": datetime.utcnow(),
                "table_data": table_records
            }
            
            result = db_collection.insert_one(page_document)
            print(f"  -> Successfully inserted into MongoDB with ID: {result.inserted_id}")