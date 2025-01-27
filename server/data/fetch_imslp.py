import json
import mwclient
import sys

def fetch_pieces():
    try:
        print("Connecting to IMSLP...")
        site = mwclient.Site('imslp.org', path='/')
        
        composers = [
            "Bach, Johann Sebastian",
            "Beethoven, Ludwig van",
            "Mozart, Wolfgang Amadeus",
            "Chopin, Frédéric",
            "Tchaikovsky, Pyotr"
        ]
        
        pieces = []
        piece_id = 1
        
        for composer in composers:
            try:
                print(f"\nProcessing composer: {composer}")
                category = site.categories[composer]
                
                print(f"Found category: {category.name}")
                
                works = list(category.members())
                print(f"Found {len(works)} works")
                
                for work in works[:10]: 
                    print(f"Processing work: {work.name}")
                    if work.namespace == 0: 
                        title = work.name.replace('_', ' ')
                        if '.' in title:
                            title = title.split('.')[0]
                            
                        metadata = {
                            "id": piece_id,
                            "title": title,
                            "composer": composer,
                            "difficulty": 7, 
                            "ratings": [],
                            "imslp_link": f"https://imslp.org/wiki/{work.name}"
                        }
                        
                        pieces.append(metadata)
                        piece_id += 1
                        print(f"Added piece: {title}")
                    else:
                        print(f"Skipped work (wrong namespace): {work.name}")
                        
            except Exception as composer_error:
                print(f"Error processing composer {composer}: {composer_error}", file=sys.stderr)
                continue
        
        print(f"\nTotal pieces found: {len(pieces)}")
        
        with open('server/data/imslp_pieces.json', 'w', encoding='utf-8') as f:
            json.dump(pieces, f, ensure_ascii=False, indent=2)
            print(f"Successfully saved {len(pieces)} pieces to imslp_pieces.json")
            
    except Exception as e:
        print(f"Error fetching IMSLP data: {e}", file=sys.stderr)
        raise e

if __name__ == "__main__":
    fetch_pieces() 