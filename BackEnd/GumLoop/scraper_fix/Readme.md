Setup Instructions (DON'T CLONE THE FULL REPO):

git clone --no-checkout https://github.com/Nicolas-Saade/ttmigtool.git
cd ttmigtool
git sparse-checkout init --cone
git sparse-checkout set BackEnd/GumLoop/scraper_fix
git checkout
cd BackEnd/GumLoop/scraper_fix
