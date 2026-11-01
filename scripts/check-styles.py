"""Validate the foundation's dependency graph and migrated stylesheet links."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re

ROOT = Path(__file__).resolve().parents[1]
RETIRED = {'neo-brutal.css', 'neo-brutal-overrides.css', 'styles-vanilla.css',
           'cookbook-shared.css', 'signature-dark.css', 'rare.css'}
errors = []

class Stylesheets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and 'stylesheet' in attrs.get('rel', '').split():
            href = attrs.get('href', '')
            if not urlsplit(href).scheme and not href.startswith('//'):
                self.links.append(unquote(urlsplit(href).path))

pages = 0
for path in ROOT.rglob('*.html'):
    if '.git' in path.parts:
        continue
    text = path.read_text()
    for retired in RETIRED:
        if re.search(r'href=[\"\'][^\"\']*' + re.escape(retired) + r'[\"\']', text):
            errors.append(f'{path.relative_to(ROOT)} still references {retired}')
    parser = Stylesheets()
    parser.feed(text)
    foundation = [href for href in parser.links if href.endswith('styles/widgets.css') or href == 'widgets.css']
    if foundation:
        pages += 1
        if len(foundation) != 1:
            errors.append(f'{path.relative_to(ROOT)} loads foundation {len(foundation)} times')
        for href in parser.links:
            if not (path.parent / href).is_file():
                errors.append(f'{path.relative_to(ROOT)}: missing stylesheet {href}')

for path in (ROOT / 'styles').glob('*.css'):
    for href in re.findall(r'@import\s+url\([\"\']([^\"\']+)', path.read_text()):
        if not (path.parent / href).is_file():
            errors.append(f'{path.name}: missing CSS import {href}')
for path in ROOT.rglob('*.css'):
    if path.name in RETIRED or path == ROOT / 'ui-core/theme.css':
        errors.append(f'Retired stylesheet still exists: {path.relative_to(ROOT)}')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {pages} pages use the new foundation; all their local CSS links and foundation imports resolve.')
