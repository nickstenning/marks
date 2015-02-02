SHELL:=/bin/bash
PATH:=$(shell npm bin):$(PATH)

default: bundle.js

clean:
	rm bundle.js

watch:
	watchify marks.js -t 6to5ify -s marks -o bundle.js

bundle.js: marks.js
	browserify $< -t 6to5ify -s marks -o $@

.PHONY: default clean watch
