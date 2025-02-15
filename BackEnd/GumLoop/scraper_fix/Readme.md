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
pip install -r ../../../requirements.txt
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

⚠️ N.B: The tool currently only supports Automated regex pattern matching with TikTok and Instagram video URLs. You can always define your own regex patterns or prompt the LLM to define these patterns for you.

```python
url = "https://www.tiktok.com/@kagan_dunlap/video/7452784466923228458"
```

```python
craped_data = """

    output:

Insurance Premiums for Trucks Transporting Fighter Jets | TikTok TikTokLog inTikTokSearchFor YouExploreFollowingUpload LIVEProfileMoreLog inCompanyProgramTerms & Policies© 2025 TikTok198.6K19048659397500:02 / 00:08kagan_dunlapKagan Dunlap · 2024-12-26FollowmoreHow high are the insurance premiums for a truck carrying a fighter jet? Shirt by @GruntStyle
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
original sound - Kagan DunlapYou may likeListen friend, do you know who Michael Vining is? #fyp #fypシ #foryou #foryoupage #miltok #military #army #navy #airforce #marinecorps #usmarines #marine #coastguard #spaceforce #soldier #kagandunlap kagan_dunlap98.8K·9h ago A Chinese robot dog celebrates the Chinese new year. kagan_dunlap1318·10h ago The Thai Hostages released from Gaza. #fyp #fypシ #foryou #foryoupage #miltok #military #army #navy #airforce #marinecorps #usmarines #marine #coastguard #spaceforce #soldier #kagandunlap kagan_dunlap1921·16h ago A medical Learjet 55 airplane crashed in a Neighborhood in Philadelphia.kagan_dunlap23.1K·1d ago The actor Idris Elba recently suggested that blunting the edges of
kitchen knives to reduce violence in the UK. kagan_dunlap10.3K·1d ago Do you think that they meant to put a pause on all of these or do you think that somebody went high and right?kagan_dunlap923·2d ago Guarantee his bootcamp experience was interesting. #fyp #fypシ #for

@YABAYABA
...
...
...
...


rd #spaceforce #soldier #kagandunlap kagan_dunlap21.6K·2d ago DHS and the Pentagon will be establishing a Detention Center in Guantanamo Bay capable of housing 30,000 people Migrants. #fyp #fypシ #foryou #foryoupage #miltok #military #army #navy #airforce #marinecorps #usmarines #marine #coastguard #spaceforce #soldier #kagandunlap kagan_dunlap1953·2d ago The Laken Riley Act has been signed into law by President Trump. kagan_dunlap6224·2d ago An American Airlines Flight Crashed into a Blackhawk helicopter in Washington DC.kagan_dunlap68.4K·3d ago Is this what light stage capitalism looks like? #fyp #fypシ #foryou #foryoupage #miltok #military #army #navy #airforce #marinecorps #usmarines #marine #coastguard #spaceforce #soldier #kagandunlap kagan_dunlap6530·3d ago The Pigs of Ukraine. #fyp #fypシ #foryou #foryoupage #miltok #military #army #navy #airforce #marinecorps #usmarines #marine #coastguard #spaceforce #soldier #kagandunlap kagan_dunlap12.3K·3d ago China’s Robot Dog workforce. kagan_dunlap2873·3d ago Bro pulled that right out of his inventory. kagan_dunlap337.1K·3d ago Turns out, Representative Nancy Mace was the first female to graduate from the Citadel. #fyp #fypシ #foryou #foryoupage #miltok #military #army #navy #airforce #marinecorps #usmarines #marine #coastguard #spaceforce #soldier #kagandunlap kagan_dunlap8149·3d ago DOGE Claims that they are currently saving the Government $1 Billion dollars a day.kagan_dunlap3410·3d ago More videos1904 commentsLog in to comment
[34mThe logs here have been shortened for readability. Try clicking 'View Inputs' or 'View Outputs' to see the complete inputs or outputs for this node.[0m

@JENJENBASIL
    """
```

### **Input Regex Parameters/Patterns**
```python
    regex_params = [
            '{"field_name": "mentions","pattern": "@([\w\.-]+)","all_matches": True, "AI_Prompt": None}',
            '{"field_name": "AI_mentions", "pattern": None, "all_matches": True, "AI_Prompt": "Extract all mentions of creators (basically @USERNAME) from the text"}',
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
