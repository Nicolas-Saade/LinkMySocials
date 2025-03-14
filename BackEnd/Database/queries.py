import requests
import csv
from dotenv import load_dotenv
import sys
import os

# Add the parent directory to the system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from SupaBaseClient import supabase

load_dotenv('../.env')

# Google Custom Search API key + Search Engine Id
api_key = os.getenv('GOOGLE_SEARCH_KEY')
cse_id = os.getenv('SEARCH_ENGINE_KEY')

def get_subscribers_list_from_csv(csv_file_path):
    with open(csv_file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        # Extract and return the Subscribers Count as a list
        return [row["Username"][1:] for row in reader]


def google_search(query):
    url = f"https://www.googleapis.com/customsearch/v1"
    params = {
        'q': query,
        'key': api_key,
        'cx': cse_id,
        'num': 1,  # First result of search
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        results = response.json().get('items', [])
        if results:
            first_result = results[0]
            return first_result.get('link')
        else:
            return "No results found."
    else:
        return f"Error: {response.status_code} - {response.text}"
    

csv_file_path = './Top2000_USA.csv'
subscribers_list = get_subscribers_list_from_csv(csv_file_path)

current_list = subscribers_list[933:966] # PROGRESSIVELY CHANGE !!!!!!!!! 468 is missing, midastouchart, mar.milne!!!!
print(current_list)

for tiktok_username in current_list:

    existing_record = supabase.table("socials_mapping").select("*").eq("tiktok_username", tiktok_username).execute()
        
    # CHeck if the record already exists
    if existing_record.data:
        print(f"Instance with tiktok username '{tiktok_username}' already exists.")
        continue

    insta_query = f"{tiktok_username} Instagram account"
    insta_link = google_search(insta_query)
    print(f"Instagram of {tiktok_username}\nLink: {insta_link}")

    twitter_query = f"{tiktok_username} Twitter account"
    twitter_link = google_search(twitter_query)
    print(f"Twitter of {tiktok_username}\nLink: {twitter_link}")

    facebook_query = f"{tiktok_username} Facebook account"
    facebook_link = google_search(facebook_query)
    print(f"Facebook of {tiktok_username}\nLink: {facebook_link}")

    # Insert a new record
    try:
        response = supabase.table("socials_mapping").insert({
        "tiktok_username": tiktok_username,
        "instagram_username": insta_link,
        "x_username": twitter_link,
        "facebook_username": facebook_link
    }).execute()
    
    except Exception as e:
        print(response({"error": e}, status=500))

    if not response or not response.data:
        print(response({"error": f"Invalid Insertion in database for {tiktok_username} ."}, status=404))


