cd "$(dirname "$0")/.."; : > wcag.txt
for f in lienzo/E-*.dc.html lienzo/D3-*.dc.html lienzo/A-*.dc.html lienzo/Entrar*.dc.html lienzo/Pagina-inicio*.dc.html; do n=$(basename $f .dc.html)
sed -e 's#<script src="./support.js"></script>##' -e 's#</style>#*{animation:none!important}</style>#' -e 's#</body>#<script src="herramientas/contraste.js"></script><script src="herramientas/estructura.js"></script></body>#' $f > w_tmp.html
d=$("/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --virtual-time-budget=2000 --dump-dom "file:///$(cygpath -m $PWD)/w_tmp.html" 2>/dev/null)
echo "## $n" >> wcag.txt; echo "$d" | tr '\n' '¶' | grep -o '<pre id="CONTRASTE">[^<]*' | cut -c20- | tr '¶' '\n' | sed 's/^/C: /' >> wcag.txt; echo "$d" | tr '\n' '¶' | grep -o '<pre id="ESTRUCTURA">[^<]*' | cut -c21- | tr '¶' '\n' | sed 's/^/E: /' >> wcag.txt
done; echo fin
