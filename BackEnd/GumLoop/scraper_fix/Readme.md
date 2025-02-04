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
