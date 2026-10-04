"""Convert the retained editable PNG room art into lightweight JPEGs for the hall."""
from pathlib import Path
from PIL import Image

asset_dir = Path(__file__).resolve().parent.parent / 'assets' / 'rooms-v3'
for name in ('rouages-comtoise-oblique-v3', 'cybertrax-serveurs-oblique-v3'):
    source = asset_dir / f'{name}.png'
    destination = asset_dir / f'{name}.jpg'
    with Image.open(source) as image:
        image.convert('RGB').save(destination, 'JPEG', quality=86, optimize=True, progressive=True)
    print(f'{destination.name}: {destination.stat().st_size} bytes')
