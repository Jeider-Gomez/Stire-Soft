#!/bin/bash
# uso: cap.sh Pantalla [alto] [ancho]
k=$1; h=${2:-1000}; w=${3:-1440}
sed -e 's#<script src="./support.js"></script>##' -e 's#</style>#*{animation:none!important}</style>#' lienzo/$k.dc.html > p_$k.html
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=$w,$h --screenshot="$(cygpath -w $PWD)\\c_$k.png" "file:///$(cygpath -m $PWD)/p_$k.html" 2>/dev/null
