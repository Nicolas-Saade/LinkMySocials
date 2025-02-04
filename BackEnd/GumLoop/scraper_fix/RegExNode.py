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
        #TODO: Check language conversion
        - creator handle
        - video caption --> Try to check language conversion
        - likes
        - comments --> Try to check language conversion
        - reshares
        - hashtags
        - sound used
        """
        info = {}

        # Extract creator handle (e.g., "brianpils" in "brianpils•Follow") --> before .Follow
        # WARNING: what if already followed? --> WebScraper never has anyone followed
        creator_match = re.search(r'([\w\.\d_]+)•Follow', block)
        info['creator handle'] = creator_match.group(1).replace("\n", " ") if creator_match else None

        # Extract video caption: take text after '•Follow' and before '… more' 
        # WARNING what if already followed? --> WebScraper never has anyone followed
        caption_match = re.search(r'•Follow(.*?)… more', block, re.DOTALL)
        caption = caption_match.group(1).strip() if caption_match else None
        info['video caption'] = caption.replace("\n", " ")

        # Extract likes ( first occurrence of "Like" followed by number)
        likes_match = re.search(r'Like([\d,\.K]+)', block)
        info['likes'] = convert_number(likes_match.group(1)) if likes_match else None

        # Extract comments (first occurrence of "Comment" followed by number)
        comments_match = re.search(r'Comment([\d,\.K]+)', block)
        info['comments'] = convert_number(comments_match.group(1)) if comments_match else None

        # Extract hashtags from the caption text (if any)
        if caption:
            hashtags = set(re.findall(r'#(\w+)', caption))
            info['hashtags'] = hashtags if hashtags else None
        else:
            info['hashtags'] = []

        # Extract sound used:
        # Look for text between moreAudio and Play button
        sound_match = re.search(r'moreAudio(.*?)(?=Play button)', block)
        if sound_match:
            sound = sound_match.group(1).strip()
            info['sound used'] = sound.replace("\n", " ")
        else:
            info['sound used'] = None

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
                    sound_text = match.group().strip()
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
            
            def extract_tiktok_interactions(txt, info):
                """
                Extracts the number of likes, only if K/.M is found, else 
                the rest of the string is returned as "post interactions".
                """
                match = re.search(r'\d+(?:\.\d+)?[KM]', txt)

                # Ensure we are capturing K and M of likes and nothing else
                if match and match.start() <= 5: 
                    likes = convert_number(match[0])
                    remaining = txt.replace(match.group(0), "", 1).strip()

                    info["likes"] = likes
                    info["post interactions"] = remaining

                else:
                    info["post interactions"] = txt

            info = {}

            # Divide data into Video and Recommendations
            you_may_like_index = block.find("You may like")

            if you_may_like_index != -1:
                cached_block = block
                block = block[:you_may_like_index]
                you_may_like = cached_block[you_may_like_index:]
            else:
                cached_block = block
                block = block
                you_may_like = ""

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
            # Remove newline characters/spaces/"output"
            first_entry = " ".join(first_entry.split())
            if first_entry.lower().strip().strip("\"").startswith(" output:") or first_entry.lower().strip().strip("\"").startswith("output:"):
                first_entry = first_entry[len(" output:"):].strip()

            # Extract the video caption from first entry.
            # The caption is everything from the beginning until the substring "| TikTok"
            if "| TikTok" in first_entry:
                caption = first_entry.split("| TikTok")[0].strip()
            else:
                caption = first_entry
            info['video caption'] = caption.replace("\n", " ")

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
                    # TODO Maybe remove more strings from this block? Maybe check for 5 no sound appearing
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
            # Format: [likes][comments][bookmarks][shares][timer]
            extract_tiktok_interactions(pre_timer, info)

            # The creator handle should be in the post_timer part.
            info['creator handle'] = post_timer.replace("\n", " ") if post_timer else None

            # Sound Used: Look for a line containing "original sound -"
            sound_match = extract_tiktok_sound_used(block)
            if not sound_match:
                sound_match = extract_tiktok_sound_used(cached_block)
            info['sound used'] = sound_match.replace("\n", " ") if sound_match else None

            # Hashtags: Collect all hashtags from the entire block.
            hashtah_matches = set(re.findall(r'#(\w+)', block))
            info['hashtags'] = hashtah_matches if hashtah_matches else None

            # TikTok Recommendations: Capture everything after "You may like", if present.
            if you_may_like:
                # Store raw "You may like" content
                #info["You May Like (RAW)"] = you_may_like.strip()
                
                # Extract hashtags from recommendations
                recommended_hashtags = set(re.findall(r'#(\w+)', you_may_like))
                info["Recommended Hashtags"] = recommended_hashtags if recommended_hashtags else set()

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
                print("URL points to a TikTok Image")
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
        if invalid_output(scraped_data, None): # WARN placeholder, should be acc platform if implemented API CALL
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

        # Use known "is muted" point to delimit the single 
        # post that we are extracting data for--> Checked that Instagram reels
        # Always start out as muted:
        # (https://www.pcmag.com/how-to/how-to-turn-off-autoplay-videos#:~:text=Instagram,-(Credit%3A%20Instagram)&text=When%20you%20open%20Instagram%2C%20the,time%20you%20open%20the%20app.)
        first_muted = scraped_data.find(" is muted")
        second_muted = scraped_data.find(" is muted", first_muted + 1)
        block = scraped_data[first_muted + len(" is muted"):second_muted]

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

    url = "https://www.tiktok.com/@loganpaul/photo/7465017501013871918?q=logan%20paul&t=1738653847846"
    scraped_data = """ 

March 27 on @Max @Jake Paul | max | TikTok Skip to content feedTikTokLog inTikTokSearchFor YouExploreFollowingUpload LIVEProfileMoreLog inCompanyProgramTerms & Policies© 2025 TikTok179.8K163210.3K35.3KloganpaulLogan Paul · 6d ago FollowThe moment you’ve waited a decade for…moreMarch 27 on @Max
@Jake Paul
M83 Solitude - Grace
    """
    params = {}

    output = main(url, scraped_data, params)
    from pprint import pprint
    pprint(output)