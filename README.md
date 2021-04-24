# My blog

The repository where I collect data from different places for presentation on
[mludv.com](https://mludv.com).

## Start development instance
Install python dependencies and run `./run`

## Pleco flashcards
I backup my flashcards database and present my latest studied flashcards here.

Current query used: [link to localhost](http://localhost:8001/pleco?sql=select+replace%28hw%2C+%27%40%27%2C+%27%27%29+as+hw%2C+date%28lastreviewedtime%2C%27unixepoch%27%29+as+date+from+pleco_flash_scores_1%0D%0Ainner+join+pleco_flash_cards+on+id+%3D+card%0D%0Aorder+by+lastreviewedtime+DESC%0D%0ALIMIT+10)
