from pathlib import Path
from datetime import date

from sqlite_utils import Database
from markdown2 import Markdown


ROOT = Path(__file__).parent
markdowner = Markdown(
    extras=[
        "fenced-code-blocks",
        "header-ids",
        "metadata",
        "smarty-pants",
        "strike",
        "tables",
        "cuddled-lists",
    ]
)
db = Database("content.sqlite")


def weekly_notes():
    for file in (ROOT / "weekly_notes").glob("*.md"):
        content = file.read_text()
        html = markdowner.convert(content)
        yield {
            "date": date.fromisoformat(file.stem),
            "markdown": content,
            "html": str(html),
        }


db["weekly_notes"].drop()
db["weekly_notes"].insert_all([note for note in weekly_notes()], pk="date")
