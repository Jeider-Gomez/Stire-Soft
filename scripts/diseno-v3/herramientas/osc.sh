#!/bin/bash
# uso: osc.sh Pantalla...  (genera -Oscuro y revisa contraste)
cd "$(dirname "$0")/.."
args=(); for k in "$@"; do t=$(grep -o '<title>[^<]*' lienzo/$k.dc.html | cut -c8-); args+=("lienzo/$k.dc.html|lienzo/$k-Oscuro.dc.html|$t (oscuro)"); done
node generador/oscuro.mjs "${args[@]}" >/dev/null
for k in "$@"; do n=$k-Oscuro; sed -e 's#<script src="./support.js"></script>##' -e 's#</style>#*{animation:none!important}</style>#' -e 's#</body>#<script src="herramientas/contraste.js"></script></body>#' lienzo/$n.dc.html > k_$n.html; echo -n "$n "; "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --virtual-time-budget=3000 --dump-dom "file:///$(cygpath -m $PWD)/k_$n.html" 2>/dev/null | grep -o '<pre id="CONTRASTE">[^<]*' | cut -c20-300; echo; done
