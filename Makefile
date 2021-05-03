.PHONY: all clean

files = browser.js index.js tiny-lexer.js token-builder.js
sources = $(addprefix lib/, $(files))
module = tinyhtml

#run: all
#	@ echo $(sources)

all: dist/tinyhtml.min.js

dist/tinyhtml.min.js: dist/ $(sources) Makefile
	@ echo "Making a minified ES module bundle"
	@ esbuild --bundle --keep-names --format=esm --minify lib/index.js > dist/tinyhtml.min.js

dist/:
	@ mkdir dist/

clean:
	@ echo "Removing dist/ directory"
	@ test -d dist/ && rm -r dist/ || exit 0
