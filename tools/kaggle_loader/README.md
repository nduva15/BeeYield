# Kaggle Loader

Small Python utility to extract text snippets from a folder of HTML/PDF files and save as CSV for downstream Kaggle preprocessing.

Setup (recommended inside a virtualenv):

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Run:

```bash
python loader.py --input ../rust_scraper/output --output beeyield_corpus.csv
```
