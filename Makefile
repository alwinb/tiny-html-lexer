.PHONY: all clean

files = browser.js index.js tiny-lexer.js token-builder.js
sources = $(addprefix lib/, $(files))
module = tinyhtml

#run: all
#	@ echo $(sources)

all: dist/tinyhtml.min.js

dist/tinyhtml.min.js: dist/ $(sources)
	@ browserify lib/browser.js | terser -cm > dist/tinyhtml.min.js

dist/:
	@ mkdir dist/

clean:
	@ test -d dist/ && rm -r dist/ || exit 0

