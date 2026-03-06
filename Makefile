PORT ?= 8044

install:
	npm install
	$(MAKE) install-hooks

# Set Git to use .husky for hooks (required for pre-commit to run). Safe to run again.
install-hooks:
	chmod +x .husky/pre-commit 2>/dev/null || true
	npx husky

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

# Remove generated artifacts (coverage, cache, dist, build)
clean:
	rm -rf coverage .cache dist build

.PHONY: install install-hooks test test-watch coverage pre-commit server deploy clean
