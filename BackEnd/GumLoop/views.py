def main(MetaData, params):
    """
    Main function to process a JSON-like .txt file and output parameters for an SQL INSERT statement.
    
    Args:
        MetaData (str): File path of the .txt JSON-like file.
        params (dict): Additional parameters (optional, for extensibility).

    Returns:
        tuple: Individual parameters for the SQL INSERT statement.
    """
    import re
    import json
    import psycopg2.extensions 

    def extract_creator_name(metadata):
        """
        Extract the creator's name from the metadata.
        Tries to find the name in 'basic.description' first, then 'search_engine'.
        """
        description = metadata.get("basic", {}).get("description", "")

        match = re.search(r"TikTok video from (.+?) \(@", str(description))
        if not match:
            # Fallback 
            match = re.search(r"TikTok video from (.+?) \(@", str(metadata))
        
        return match.group(1).replace("'", "''") if match else None

    def extract_creator_handle(metadata):
        description = metadata.get("basic", {}).get("description", "")
        match = re.search(r"\(@(.+?)\)", description)

        if not match:
            # Fallback
            match = re.search(r"\(@(.+?)\)", str(metadata))

        return f"@{match.group(1)}" if match else None


    def extact_tiktok_url(metadata):
        # Convert metadata to a string to search for the URL
        metadata_str = json.dumps(metadata)  # Convert the entire JSON object to a string

        # Regex pattern to match a TikTok URL starting with 'https://www.tiktok'
        pattern = r"https://www\.tiktok[^\s\"']*"

        # Search for the first match of the pattern
        match = re.search(pattern, metadata_str)

        # Return the matched URL or None if no match is found
        return match.group(0) if match else None

    def extract_hashtags(description):
        return re.findall(r"#\w+", description)

    def extract_likes_count(description):
        """
        Extract the number of likes from the description, handling shorthand formats like '7k' or '2.5m'.
        """
        match = re.search(r"(\d+(?:\.\d+)?)([km]?) Likes", description, re.IGNORECASE)
        if match:
            number = float(match.group(1))  # Extract the numeric part
            suffix = match.group(2).lower()  # Extract the suffix (e.g., 'k', 'm')

            # Convert based on the suffix
            if suffix == 'k':
                number *= 1_000  # Convert thousands
            elif suffix == 'm':
                number *= 1_000_000  # Convert millions

            return int(number)
        return 0  # Return 0 if no match is found

    def extract_keywords(metadata):
        """
        Extract the value of the 'keywords' field from the metadata.
        First checks 'basic.keywords', then falls back to 'search_engine.keywords'.

        Args:
            metadata (dict): JSON-like metadata structure.

        Returns:
            list: A list of keywords, or an empty list if not found.
        """
        # Try to get 'keywords' from 'basic' first
        keywords = metadata.get("basic", {}).get("keywords", None)
        
        # If 'keywords' is not found in 'basic', try 'search_engine'
        if not keywords:
            keywords = metadata.get("search_engine", {}).get("keywords", None)

        # If 'keywords' is still None, return an empty list
        if not keywords:
            return []

        # Split the keywords into a list if they are a comma-separated string
        return [keyword.strip() for keyword in keywords.split(",")]

    def extract_comments_count(description):
        match = re.search(r"(\d+) Comments", description)
        return int(match.group(1)) if match else 0
    
    def process_metadata(metadata_str):
        """Process metadata and extract necessary parameters."""
        # Remove all characters before the first '{'
        metadata_str = metadata_str[metadata_str.find('{'):]

        try:
            metadata = json.loads(metadata_str)
        except json.JSONDecodeError as e:
            print(f"Error decoding metadata JSON: {e}")
            return None

        # Extract parameters from metadata
        tiktok_url = extact_tiktok_url(metadata)
        creator_name = extract_creator_name(metadata)
        creator_handle = extract_creator_handle(metadata)
        title = metadata.get("basic", {}).get("title", "")

        description = metadata.get("basic", {}).get("description", "")  # No escaping of special characters
        hashtags = extract_hashtags(str(metadata))
        likes_count = extract_likes_count(str(metadata))
        comments_count = extract_comments_count(str(metadata))
        keywords = extract_keywords(metadata)

        # Format arrays as regular Python lists
        formatted_hashtags = [f"{tag}" for tag in hashtags]
        formatted_keywords = [f"{keyword}" for keyword in keywords]

        # Return all values as individual items
        x = [
            tiktok_url,
            creator_name,
            creator_handle,
            title,
            description,
            formatted_hashtags,
            likes_count,
            comments_count,
            formatted_keywords
        ]

        print(x)
        return x

    # Step 1: Read the metadata file
    try:
        with open(MetaData, 'r', encoding='utf-8') as file:
            metadata_str = file.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return None

    # Step 2: Process the metadata and extract parameters
    result = process_metadata(metadata_str)
    
    if result is None:
        return None

    # Manually populate variables from the result list
    tiktok_url = result[0] if result[0] is not None else 'NULL'
    creator_name = result[1] if result[1] is not None else 'NULL'
    creator_handle = str(result[2]) if result[2] is not None else 'NULL'
    title = str(result[3]) if result[3] is not None else 'NULL'
    description = str(result[4]) if result[4] is not None else 'NULL'
    formatted_hashtags = str(result[5]) if result[5] is not None else 'NULL'
    likes_count = str(result[6]) if result[6] is not None else 'NULL'
    comments_count = str(result[7]) if result[7] is not None else 'NULL'
    formatted_keywords = str(result[8]) if result[8] is not None else 'NULL'

    # Return the individual variables as a tuple
    return tiktok_url, creator_name, creator_handle, title, description, formatted_hashtags, likes_count, comments_count, formatted_keywords