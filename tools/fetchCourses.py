from scraper.cuscraper import CourseScraper
import os

current_term = "2024-25 Term 1"

# fetch data
old_data_dir = os.path.abspath("../data")

cs = CourseScraper(merge_dir=old_data_dir, current_term=current_term)
timestamp = cs.parse_all(skip_parsed=True, verbose=False)

# derive data
cs.post_processing(stat=True)
cs.info()

p = os.system(f'sh move_data.sh {timestamp}')
