PORT ?= 8044

install:
	npm install

server:
	@echo "Serving at http://localhost:$(PORT)"
	@python3 -m http.server $(PORT)

# Needs Vercel CLI + linked project; run `vercel env pull` once for KV/Redis env
dev:
	vercel dev

deploy:
	npm run deploy

.PHONY: install server dev deploy
