PORT ?= 8044

server:
	@echo "Serving at http://localhost:$(PORT)"
	@python3 -m http.server $(PORT)

.PHONY: server
