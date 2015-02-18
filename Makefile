.PHONY: default clean

SHELL := /bin/bash
PATH  := $(shell npm bin):$(PATH)

SRC = $(wildcard src/*.js)
LIB = $(SRC:src/%.js=lib/%.js)

BROWSERIFY = node_modules/karma-browserify/node_modules/.bin/browserify -t babelify

default: $(LIB)

pkg: pkg/marks.js

clean:
	rm -rf .deps/
	rm -rf lib/
	rm -rf pkg/

lib/%.js: src/%.js
	@mkdir -p $(@D)
	babel $< -o $@

pkg/marks.js: src/marks.js
	@# Build all-in-one bundle
	@mkdir -p $(@D)
	$(BROWSERIFY) -s marks $< -o $@

	@# Compute dependencies for rebuilds
	@mkdir -p .deps/
	@$(BROWSERIFY) --list $< | sed 's#^#$@: #' >.deps/marks.d

-include .deps/*.d
