#!/bin/bash

set -e
cd "$(dirname "$0")/backend"
npx openapi-typescript docs/openapi.yaml --output ../libs/types/api.d.ts

echo "✅ API types generated in libs/types/api.d.ts"