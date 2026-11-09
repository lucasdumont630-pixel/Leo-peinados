"""Genera una versión de un solo archivo (CSS y JS incrustados) para vista previa.
Uso: python3 tools/build-artifact.py salida.html"""
import pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text()
head = re.search(r"<!-- HEAD:START -->(.*?)<!-- HEAD:END -->", html, re.S).group(1)
head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', "", head)
body = re.search(r"<!-- BODY:START -->(.*?)<!-- BODY:END -->", html, re.S).group(1)
css = (root / "styles.css").read_text()
js = (root / "script.js").read_text()
out = f"{head.strip()}\n<style>\n{css}</style>\n{body.strip()}\n<script>\n{js}</script>\n"
pathlib.Path(sys.argv[1]).write_text(out)
