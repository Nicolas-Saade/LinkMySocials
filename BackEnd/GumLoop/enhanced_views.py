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
    
    class MetadataExtractor:
        def __init__(self):
            self.metadata_fields = {
                'tiktok_url': None,
                'creator_name': None,
                'creator_handle': None,
                'title': None,
                'description': None,
                'hashtags': None,
                'likes_count': None,
                'comments_count': None,
                'keywords': None
            }
            
            # extraction patterns for each field
            self.patterns = {
                'tiktok_url': r'https://www\.tiktok\.com/[@\w/\-]+',
                'creator_name': [
                    r'TikTok video from (.+?) \(@',
                    r'og:title": "(.+?) on TikTok"'
                ],
                'creator_handle': [
                    r'\(@(.+?)\)',
                    r'/@([\w\.]+)/'
                ],
                'likes_count': [
                    r'(\d+(?:\.\d+)?[KkMm]?) Likes',
                    r'(\d+) Likes'
                ],
                'comments_count': r'(\d+) Comments'
            }

        def _convert_count(self, count_str):
            """Convert count strings like '1.5K' or '2M' to integers."""
            if not count_str:
                return 0
                
            multipliers = {'k': 1000, 'm': 1000000}
            count_str = count_str.lower().strip()
            
            try:
                if count_str[-1] in multipliers:
                    number = float(count_str[:-1])
                    return int(number * multipliers[count_str[-1]])
                return int(float(count_str))
            except (ValueError, IndexError):
                return 0

        def _extract_with_patterns(self, text, patterns):
            """Try multiple patterns to extract a value."""
            if isinstance(patterns, str):
                patterns = [patterns]
                
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    return match.group(1)
            return None

        def _extract_hashtags(self, text):
            """Extract hashtags from text."""
            return re.findall(r'#\w+', text)

        def _extract_keywords(self, metadata):
            """Extract keywords from various possible locations in metadata."""
            # Check different possible locations for keywords
            locations = [
                ('seo', 'keywords'),
                ('basic', 'keywords'),
                ('search_engine', 'keywords')
            ]
            
            for parent, child in locations:
                keywords = metadata.get(parent, {}).get(child)
                if keywords:
                    if isinstance(keywords, str):
                        return [kw.strip() for kw in keywords.split(',')]
                    elif isinstance(keywords, list):
                        return keywords
                    
            return []

        def _deep_search(self, metadata, field):
            """
            Deep search through all metadata values for a specific field pattern.
            Only searches if the field is still None in metadata_fields.
            """
            if self.metadata_fields[field] is not None:
                return

            metadata_str = json.dumps(metadata)
            
            if field in ['tiktok_url', 'creator_name', 'creator_handle']:
                value = self._extract_with_patterns(metadata_str, self.patterns[field])
                if value:
                    self.metadata_fields[field] = value
            elif field in ['likes_count', 'comments_count']:
                value = self._extract_with_patterns(metadata_str, self.patterns[field])
                if value:
                    self.metadata_fields[field] = self._convert_count(value)

        def extract_metadata(self, metadata):
            """
            Main method to extract all metadata fields from the input dictionary.
            """
            # Reset fields for new extraction
            self.metadata_fields = {k: None for k in self.metadata_fields}
            
            # Direct extractions
            self.metadata_fields['title'] = metadata.get('basic', {}).get('title')
            
            # Extract description from multiple possible locations
            for path in [
                ('seo', 'description'),
                ('opengraph', 'description'),
                ('twitter', 'description')
            ]:
                desc = metadata.get(path[0], {}).get(path[1])
                if desc:
                    self.metadata_fields['description'] = desc
                    break
            
            # Extract hashtags from description or full metadata
            metadata_str = json.dumps(metadata)
            self.metadata_fields['hashtags'] = self._extract_hashtags(metadata_str)
            
            # Extract keywords
            self.metadata_fields['keywords'] = self._extract_keywords(metadata)
            
            # Deep search for remaining None fields
            for field in self.metadata_fields:
                if self.metadata_fields[field] is None:
                    self._deep_search(metadata, field)
            
            return self.metadata_fields

    try:
        # Read and parse the metadata file
        with open(MetaData, 'r', encoding='utf-8') as file:
            content = file.read()
            # Find the first valid JSON object
            json_start = content.find('{')
            if json_start == -1:
                raise ValueError("No JSON object found in file")
            
            metadata = json.loads(content[json_start:])
            
            # Extract metadata using the enhanced extractor
            extractor = MetadataExtractor()
            result = extractor.extract_metadata(metadata)
            
            # Convert the results to the expected format
            return (
                result['tiktok_url'] or 'NULL',
                result['creator_name'] or 'NULL',
                result['creator_handle'] or 'NULL',
                str(result['title']) if result['title'] else 'NULL',
                str(result['description']) if result['description'] else 'NULL',
                str(result['hashtags']) if result['hashtags'] else 'NULL',
                str(result['likes_count']) if result['likes_count'] is not None else 'NULL',
                str(result['comments_count']) if result['comments_count'] is not None else 'NULL',
                str(result['keywords']) if result['keywords'] else 'NULL'
            )
            
    except Exception as e:
        print(f"Error processing metadata file: {e}")
        return None 