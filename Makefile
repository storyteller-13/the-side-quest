PORT ?= 8044

serve:
	@echo "Serving at http://localhost:$(PORT)"
	@python3 -m http.server $(PORT)

.PHONY: serve
