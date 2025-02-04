# **Gumloop Web Scraper Regex Formatter**  

## **Setup Instructions (Avoid Cloning the Full Repo)**  

### **1. Clone Only the Required Folder**  
To avoid downloading the entire repository, use **sparse checkout**:  

```bash
git clone --no-checkout https://github.com/Nicolas-Saade/ttmigtool.git
cd ttmigtool
git sparse-checkout init --cone
git sparse-checkout set BackEnd/GumLoop/scraper_fix
git checkout
cd BackEnd/GumLoop/scraper_fix
```
### **2. Set Up a Virtual Environment & Install Dependencies**  

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
```

Create a .env file at the same level as RegExNode.py and RegExNodeNoAI.py, then add the following line:

```bash
GEMINI_API_KEY=GEMINI-API-KEY-SENT-VIA-MAIL
```

### **3. Run the tool**  

```bash
python3 RegExNode.py # Run python3 RegExNodeNoAI.py for the version supported on the custom Gumloop node
```

### Testing Instructions **  

You can use the provided test files or any output from a Gumloop scraping node.
	•	Place the scraped data inside the scraped_data variable.
	•	Add the URL in the url variable.
	•	Provide either custom regex patterns or LLM prompts within the regex_params list (be careful not to put in a LLM prompt and a regex for the same element in the list!).

 ## **Sample Test: Web Scraper Regex Formatting**

### **Input (Raw Scraped Data + URL)**
```json
url = https://www.tiktok.com/@kagan_dunlap/video/7452784466923228458

{
  "text": "Insurance Premiums for Trucks Transporting Fighter Jets | TikTok TikTokLog inTikTokSearchFor YouExploreFollowingUpload LIVEProfileMoreLog inCompanyProgramTerms & Policies© 2025 TikTok198.6K19048659397500:02 / 00:08kagan_dunlapKagan Dunlap · 2024-12-26FollowmoreHow high are the insurance premiums for a truck carrying a fighter jet? Shirt by @GruntStyle
#fyp
#fypシ
#foryou
#foryoupage
#miltok
@ABIABI
#military
#army
#navy
#airforce
#marinecorps
#usmarines
#marine
#coastguard
#spaceforce
#soldier
#kagandunlap
original sound - Kagan DunlapYou may likeListen friend, do you know who Michael Vining is? #fyp #fypシ #foryou #foryoupage #miltok #military #army #navy #airforce #marinecorps #usmarines #marine #coastguard #spaceforce #soldier #kagandunlap kagan_dunlap98.8K·9h ago A Chinese robot dog celebrates the Chinese new year..."
}
```

### **Input Regex Parameters/Patterns**
```json
[
    {"field_name": "mentions","pattern": "@([\\w\\.-]+)","all_matches": true, "AI_Prompt": null},
    {"field_name": "AI_mentions", "pattern": null, "all_matches": true, "AI_Prompt": "Extract all mentions of creators (basically @USERNAME) from the text"}
]
```

### **Formatted Output**
```json
{
  "creator_handle": "kagan_dunlap",
  "hashtags": [
    "airforce", "army", "coastguard", "foryou", "foryoupage",
    "fyp", "fypシ", "kagandunlap", "marine", "marinecorps",
    "military", "miltok", "navy", "soldier", "spaceforce", "usmarines"
  ],
  "video_caption": "Insurance Premiums for Trucks Transporting Fighter Jets",
  "post_interactions": "190486593975",
  "likes": 198600,
  "sound_used": "original sound - Kagan Dunlap",
  "mentions": ["@ABIABI", "@YABAYABA", "@GruntStyle", "@JENJENBASIL"],
  "AI_mentions": ["@ABIABI", "@YABAYABA", "@GruntStyle", "@JENJENBASIL"]
}
```
