def main(url, scraped_data, params):
    import re
    import json
    import urllib.request
    import urllib.error
    from pprint import pprint
    import dotenv
    import os
    
    dotenv.load_dotenv()
    
    bearer = os.getenv("BEARER")
    api_header = os.getenv("HEADER")
    payload = os.getenv("PAYLOAD")
    api_url = os.getenv("API_URL")

    def convert_number(num_str):
        """
        Convert number string with commas, 'K', or 'M' into int.
        """
        if not num_str:
            return None
        num_str = num_str.strip()

        if 'M' in num_str:
            try:
                return int(float(num_str.replace('M', '')) * 1000000)
            except ValueError:
                return None

        if 'K' in num_str:
            try:
                return int(float(num_str.replace('K', '')) * 1000)
            except ValueError:
                return None
        try:
            return int(num_str.replace(',', ''))
        except ValueError:
            return num_str

    def extract_instagram_post_info(block):
        """
        Extract information from a single post block.
        Returns a dictionary with keys:
        - creator handle
        - video caption
        - likes
        - comments
        - reshares
        - hashtags
        - sound used
        """
        info = {}

        # Extract creator handle (e.g., "brianpils" in "brianpils•Follow") --> before .Follow
        # TODO: what if already followed? --> WebScraper never has anyone followed
        creator_match = re.search(r'([\w\.\d_]+)•Follow', block)
        info['creator handle'] = creator_match.group(1) if creator_match else None

        # Extract video caption: take text after '•Follow' and before '… more' 
        # TODO what if already followed? --> WebScraper never has anyone followed
        caption_match = re.search(r'•Follow(.*?)… more', block, re.DOTALL)
        caption = caption_match.group(1).strip() if caption_match else None
        info['video caption'] = caption

        # Extract likes ( first occurrence of "Like" followed by number)
        likes_match = re.search(r'Like([\d,\.K]+)', block)
        info['likes'] = convert_number(likes_match.group(1)) if likes_match else None

        # Extract comments (first occurrence of "Comment" followed by number)
        comments_match = re.search(r'Comment([\d,\.K]+)', block)
        info['comments'] = convert_number(comments_match.group(1)) if comments_match else None

        # Extract reshares (if present: "Share" followed by number)
        reshares_match = re.search(r'Share([\d,\.K]+)', block)
        info['reshares'] = convert_number(reshares_match.group(1)) if reshares_match else None

        # Extract hashtags from the caption text (if any)
        if caption:
            hashtags = set(re.findall(r'#(\w+)', caption))
            info['hashtags'] = hashtags
        else:
            info['hashtags'] = []

        # Extract sound used:
        # Using heuristic: Look for text after "Audio image" up to "· Original audio"
        # TODO Check how robust this is.
        sound_match = re.search(r'Audio image\s*([\w\.\d_]+)\s*·\s*Original audio', block)
        info['sound used'] = sound_match.group(1) if sound_match else None

        return info

    def extract_tiktok_post_info(block):
            """
            Extract TikTok post information from the scraped block.
            Returns a dictionary with the following keys:
            - creator handle
            - video caption
            - likes
            - comments
            - reshares
            - hashtags
            - sound used
            """
            def extract_tiktok_sound_used(block):
                """
                Extracts the TikTok video's sound used from a block of text.
                
                The function first looks for a pattern such as:
                    "original sound - <sound details> You may like"
                
                If the pattern is found, it returns the captured <sound details> (trimmed).
                
                If the pattern is not found, it falls back to:
                - Taking the part of the block before the phrase "You may like"
                - Splitting it into lines
                - Returning the first non-empty line that is not just punctuation (like dots)
                
                :param block: The full text block from which to extract the sound used.
                :return: The extracted sound used string, or None if nothing is found.
                """
                import re

                # Attempt 1: Pattern match "original sound" up to "You may like"
                sound_pattern = re.compile(
                    r'original\s+sound\s*-\s*(.*?)(?=You may like)', 
                    re.IGNORECASE | re.DOTALL
                )
                match = sound_pattern.search(block)

                if match:
                    sound_text = match.group(1).strip()
                    if sound_text:
                        return sound_text

                # Fallback: Look for "You may like" and use the text before it.

                you_may_like_index = block.find("You may like")

                if you_may_like_index != -1:
                    # Reverse iterate until newline character before "You may like"
                    line_start_index = block.rfind("\n", 0, you_may_like_index)

                    if line_start_index == -1:
                        # If no newline was found, the sound name starts from the beginning of the block
                        sound_name = block[:you_may_like_index].strip()
                    else:
                        # Capture everything from the first character after the newline to "You may like"
                        sound_name = block[line_start_index + 1:you_may_like_index].strip()

                    return sound_name  # Return the extracted sound name

                return None  # Return None if "You may like" was not found
            
            info = {}
            
            # 1. Extract the first entry:
            #    Everything from the beginning until the marker "& Policies© 2025 TikTok"
            policy_marker = "& Policies© 2025 TikTok"
            idx = block.find(policy_marker)
            if idx != -1:
                first_entry = block[:idx+ len(policy_marker)]
                remainder = block[idx + len(policy_marker):].strip()
            else:
                first_entry = block.strip()
                remainder = block
            block = remainder

            # Clean up first_entry:
            # Remove newline characters/spaces/"output".
            first_entry = " ".join(first_entry.split())
            if first_entry.lower().strip("\"").startswith(" output:"):
                first_entry = first_entry[len(" output: "):].strip()

            # Extract the video caption from first entry.
            # The caption is everything from the beginning until the substring "| TikTok"
            if "| TikTok" in first_entry:
                caption = first_entry.split("| TikTok")[0].strip()
            else:
                caption = first_entry
            info['video caption'] = caption

            # Extract the timer from the remaining block.
            timer_pattern = re.compile(r'\d\d:\d\d\s*/\s*\d\d:\d\d')
            timer_match = timer_pattern.search(block)

            if timer_match:
                # Define the start of the second entry.
                start_index = timer_match.start()
                # Find the marker " · " after the timer match.
                end_index = block.find(" · ", start_index)
                
                if end_index == -1:
                    # If no marker is found, assume the second entry is from the timer match to the end.
                    second_entry = block[:].strip()
                    block = block[end_index:]
                else:
                    # Capture the second entry: from the beginning until the marker.
                    second_entry = block[:end_index].strip()
                    # Remove the extracted second_entry and the marker from block.
                    part_before = block[:start_index]
                    part_after = block[end_index + len(" · "):]
                    # TODO Maybe remove more strings from this block?
                    block = (part_before + part_after).strip()
            else:
                second_entry = ""

            # Expected pattern in second_entry:
            #   [likes][comments][bookmarks][shares][timer][creator handle]
            # For EX:
            #   "12.4K31224980500:03 / 00:18daily..motiv8tiondailymotiv8tion"
            #
            # First, find the timer within second_entry.
            timer_match = timer_pattern.search(second_entry)
            if timer_match:
                # Split second_entry into pre_timer and post_timer parts.
                pre_timer = second_entry[:timer_match.start()].strip()
                post_timer = second_entry[timer_match.end():].strip()
            else:
                pre_timer = second_entry
                post_timer = ""
            
            # Now, extract number-like tokens from pre_timer.
            numbers = re.findall(r'(\d+(?:\.\d+)?[KM]?)', pre_timer)
            # We expect numbers in order: likes, comments, bookmarks, shares.
            # TODO pattern matching for likes, comments, bookmarks, shares can be improved
            if numbers and len(numbers) >= 4:
                info['likes'] = convert_number(numbers[0])
                info['comments'] = convert_number(numbers[1])
                info['bookmarks'] = convert_number(numbers[2])
                info['shares'] = convert_number(numbers[3])
            else:
                info['post interactions'] = numbers

            # The creator handle should be in the post_timer part.
            info['creator handle'] = post_timer if post_timer else None

            # Sound Used: Look for a line containing "original sound -"
            # TODO can also maybe improve a bit on this.
            sound_match = extract_tiktok_sound_used(block)
            info['sound used'] = sound_match if sound_match else None

            # Hashtags: Collect all hashtags from the entire block.
            info['hashtags'] = set(re.findall(r'#(\w+)', block))

            # TikTok Recommendations: Capture everything after "You may like", if present.
            # TODO, this can also be improved.
            rec_marker = "You may like"
            rec_index = block.find(rec_marker)
            if rec_index != -1:
                recommendations = block[rec_index + len(rec_marker):].strip()
                info["TikTok Recommendations"] = recommendations if recommendations else None
            else:
                info["TikTok Recommendations"] = None

            return info

    def invalid_output(block, platform):
        """
        Check if the scraped_data is invalid.
        
        Returns True if any of the following conditions are met:
        For Tiktok:
        - The text "& Policies© 2025 TikTok" is not found.
        - The text "| TikTok" is not found.
        - A timer pattern "XX:XX / XX:XX" is not found.
        
        For Instagram:
        - The text "Audio is muted" is not found.
        - The text pattern •Follow is not found.
        - The text patterns: Like, Comment, Share are not found.
        
        Otherwise, returns False.
        """
        
        if platform == "tiktok":
            if "& Policies© 2025 TikTok" not in scraped_data:
                return True
            if "| TikTok" not in scraped_data:
                return True

            timer_pattern = re.compile(r'\d\d:\d\d\s*/\s*\d\d:\d\d')
            if not timer_pattern.search(scraped_data):
                return True

        elif platform == "instagram":
            if "Audio is muted" not in scraped_data:
                return True
            if "•Follow" not in scraped_data:
                return True
            if "Like" not in scraped_data:
                return True
            if "Comment" not in scraped_data:
                return True
            if "Share" not in scraped_data:
                return True

        return False

    def call_pipeline_api(payload):
        """
        Re-trigger the pipeline API call using the given payload.
        This function uses urllib.request from the standard library.
        """
        url = api_url
        headers = api_header
        
        payload_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=payload_data, headers=headers, method="POST")
        
        try:
            with urllib.request.urlopen(req) as response:
                result = response.read().decode("utf-8")
                print("API call succeeded. Response:")
                print(result)
                return result
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8")
            print("HTTP error:", e.code, err)
            return {"error": f"HTTP error: {e.code} {err}"}
        except urllib.error.URLError as e:
            print("URL error:", e.reason)
            return {"error": f"URL error: {e.reason}"}

    def toggle_advanced_scraping(payload):
        """
        Toggle the "Use Advanced Scraping?" parameter in the pipeline payload for the Website Scraper node.
        """
        if "pl_config" in payload and "pipeline" in payload["pl_config"]:
            for node in payload["pl_config"]["pipeline"]:
                if node.get("operator") == "Website Scraper":
                    current = node.get("parameters", {}).get("Use Advanced Scraping?")
                    if current is not None:
                        new_value = "false" if current.lower() == "true" else "true"
                        node["parameters"]["Use Advanced Scraping?"] = new_value
                        print(f"Toggled 'Use Advanced Scraping?' from {current} to {new_value}")
        return payload
    
    def api_call(scraped_data, payload=None):
        """
        Checks the scraped_data for required markers. If the data is invalid,
        toggles the "Use Advanced Scraping?" parameter and re-triggers the pipeline API call.
        
        Returns the API response if re-triggered, or None if the scraped_data appears valid.
        """
        if invalid_output(scraped_data, None): # TODO placeholder, should be acc platform
            print("Invalid scraped data detected. Re-triggering API with toggled advanced scraping.")
            # If no payload is provided, use a hard-coded payload.
            if payload is None:
                payload = payload
            updated_payload = toggle_advanced_scraping(payload)
            api_response = call_pipeline_api(updated_payload)
            return {"api_response": api_response, "note": "Invalid scraped data; re-triggered pipeline."}
        else:
            return None
        
    formatted_output = []

    # Determine platform
    if "tiktok" in url.lower():
        platform = "tiktok"
        formatted_output = extract_tiktok_post_info(scraped_data)
        if invalid_output(scraped_data, platform):
            # Check if the scraped data is invalid. If so, retrigger flow.
            formatted_output = "Invalid scraped data"
            return formatted_output

            # Simulating API start pipeline call
            # api_result = api_call(scraped_data)
            # if api_result is not None:
            #     formatted_output = api_result["api_response"]
            #     return formatted_output
            # return "Invalid scraped data"
        return formatted_output
    elif "instagram" in url.lower():
        platform = "instagram"

        if invalid_output(scraped_data, platform):
            # Check if the scraped data is invalid. If so, retrigger flow.
            formatted_output = "Invalid scraped data"
            return formatted_output

            # Simulating API start pipeline call
            # api_result = api_call(scraped_data)
            # if api_result is not None:
            #     formatted_output = api_result["api_response"]
            #     return formatted_output
            # return "Invalid scraped data"

        # For some reason, the scraped data contains a duplicate set of
        # posts starting with a second occurrence
        # of the header "InstagramLog InSign Up" --> Not to count!!!!!
        header = "InstagramLog InSign Up"
        first_index = scraped_data.find(header)
        second_index = scraped_data.find(header, first_index + len(header))

        if second_index != -1:
            scraped_data = scraped_data[:second_index]

        # Use known "Audio is muted" point --> Checked that Instagram reels
        # Always start out as muted:
        # (https://www.pcmag.com/how-to/how-to-turn-off-autoplay-videos#:~:text=Instagram,-(Credit%3A%20Instagram)&text=When%20you%20open%20Instagram%2C%20the,time%20you%20open%20the%20app.)
        blocks = scraped_data.split("Audio is muted")
        
        # Iterating over all blocks/videos extracted.
        # And choosing the first one with meaningful 
        # results (the video we are looking for)
        for block in blocks:
            block = block.strip()
            if not block:
                continue

            post_info = extract_instagram_post_info(block)
            post_info['video_url'] = url
            post_info['platform'] = platform

            formatted_output.append(post_info)

        for attempt in formatted_output:
            if attempt['likes'] and attempt['comments'] and attempt['creator handle']:
                formatted_output = attempt
                return formatted_output
    else:
        raise ValueError(f"Unsupported platform: {platform}")
    return formatted_output

if __name__ == "__main__":

    url = "https://www.instagram.com/reels/DFiM1rjs7ZX/?hl=en"
    scraped_data = """
    output:

Instagram
InstagramLog InSign UpAudio is mutedjadnasrr•Followلما تحاول تلطف جو 🙂😂 لاتنسو الفولو ❤️‍🔥… moreAudio imagejadnasrr · Original audioPlay button iconLike5,682Comment205ShareMoreAudio is mutednick.digiovanni•FollowRatatouille IRLRatatouille IRL… moreAudio imagenick.digiovanni · Original audioPlay button iconLike393KComment1,645ShareMoreAudio is mutedthepointerbrothers•Followand the games always last 45 mins 😭😂 #thepointerbrothersand the games always last 45 mins 😭😂 #thepointerbrothers… moreAudio imagehits_dingers14 · Original audiohits_dingers14 · Original audioTagged users2 peoplePlay button iconLike522KComment623ShareMoreAudio is mutedjeanie3legs•FollowTrue story 😂 #pippadog #dawnstoughongrease #smilingdog #threeleggeddogTrue story 😂 #pippadog #dawnstoughongrease #smilingdog #threeleggeddog… moreAudio imagedadjokescentralofficial · Original audiodadjokescentralofficial · Original audioPlay button iconLike103KComment963ShareMore

InstagramLog InSign UpAudio is mutedjadnasrr•Followلما تحاول تلطف جو 🙂😂 لاتنسو الفولو ❤️‍🔥… moreAudio imagejadnasrr · Original audioPlay button iconLike5,682Comment205ShareMoreAudio is mutednick.digiovanni•FollowRatatouille IRLRatatouille IRL… moreAudio imagenick.digiovanni · Original audioPlay button iconLike393KComment1,645ShareMoreAudio is mutedthepointerbrothers•Followand the games always last 45 mins 😭😂 #thepointerbrothersand the games always last 45 mins 😭😂 #thepointerbrothers… moreAudio imagehits_dingers14 · Original audioTagged users2 peoplePlay button iconLike522KComment623ShareMoreAudio is mutedjeanie3legs•FollowTrue story 😂 #pippadog #dawnstoughongrease #smilingdog #threeleggeddogTrue story 😂 #pippadog #dawnstoughongrease #smilingdog #threeleggeddog… moreAudio imagedadjokescentralofficial · Original audioPlay button iconLike103KComment963ShareMore
    """
    params = {}

    output = main(url, scraped_data, params)
    from pprint import pprint
    pprint(output)