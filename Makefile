PORT ?= 8044

install:
	npm install

# Run unit tests (config, API, game-utils, HTML)
test:
	npm run test

# Run tests in watch mode
test-watch:
	npm run test:watch

# Run tests with coverage report
coverage:
	npm run coverage

# Run tests + coverage (same as pre-commit; use for CI or manual check)
pre-commit:
	npm run test && npm run coverage

# Needs Vercel CLI + linked project; run `vercel env pull` once for KV/Redis env
server:
	vercel dev --listen $(PORT)

deploy:
	npm run deploy

.PHONY: install test test-watch coverage pre-commit server deploy
