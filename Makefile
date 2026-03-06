PORT ?= 8044

install:
	npm install

# Needs Vercel CLI + linked project; run `vercel env pull` once for KV/Redis env
server:
	vercel dev --listen $(PORT)

deploy:
	npm run deploy

.PHONY: install server deploy
