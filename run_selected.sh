#!/bin/bash

echo "🚀 Running all Playwright tests..."

set -e  # Exit if any command fails

# Run all tests (bail option removed)
npx playwright test

# Optional: show HTML report locally
npx playwright show-report playwright-report

echo "✅ All tests finished."
