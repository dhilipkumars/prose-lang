#!/bin/bash
# Container Management API - curl test script
# Usage: ./test_containers.sh [BASE_URL]
# Default BASE_URL: http://localhost:8081

BASE_URL="${1:-http://localhost:8081}"
API="${BASE_URL}/api/containers"
PASS=0
FAIL=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }

assert_status() {
    local test_name="$1" expected="$2" actual="$3"
    if [ "$actual" -eq "$expected" ]; then
        green "✓ ${test_name} (HTTP ${actual})"
        PASS=$((PASS + 1))
    else
        red "✗ ${test_name} - Expected HTTP ${expected}, got ${actual}"
        FAIL=$((FAIL + 1))
    fi
}

echo "=== Container Management API Tests ==="
echo "Base URL: ${API}"
echo ""

# 1. Create a container
echo "--- CREATE ---"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API}" \
    -H "Content-Type: application/json" \
    -d '{"containerName":"Water Tank","productId":1,"quantity":100,"units":"liters"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create Container" 201 "$HTTP_CODE"
CONTAINER_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['containerId'])" 2>/dev/null)
echo "  Created container ID: ${CONTAINER_ID}"

# 2. Get by ID
echo ""
echo "--- GET BY ID ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}/${CONTAINER_ID}")
assert_status "Get Container by ID" 200 "$HTTP_CODE"

# 3. Get non-existent
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}/99999")
assert_status "Get non-existent Container (404)" 404 "$HTTP_CODE"

# 4. Create another with same product
echo ""
echo "--- CREATE SECOND ---"
curl -s -o /dev/null -w "" -X POST "${API}" \
    -H "Content-Type: application/json" \
    -d '{"containerName":"Oil Drum","productId":1,"quantity":50,"units":"gallons"}'

# 5. Get by product ID
echo "--- GET BY PRODUCT ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}/by-product/1")
assert_status "Get Containers by Product ID" 200 "$HTTP_CODE"

# 6. Update
echo ""
echo "--- UPDATE ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "${API}/${CONTAINER_ID}" \
    -H "Content-Type: application/json" \
    -d '{"containerName":"Updated Tank","productId":1,"quantity":200,"units":"liters"}')
assert_status "Update Container" 200 "$HTTP_CODE"

# 7. List with pagination
echo ""
echo "--- LIST (PAGINATED) ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}?page=0&size=5")
assert_status "List Containers (page 0, size 5)" 200 "$HTTP_CODE"

# 8. List with filter
echo "--- LIST (FILTERED) ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}?containerName=Updated")
assert_status "List Containers (filter by name)" 200 "$HTTP_CODE"

# 9. Delete
echo ""
echo "--- DELETE ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${API}/${CONTAINER_ID}")
assert_status "Delete Container" 204 "$HTTP_CODE"

# 10. Confirm deletion
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}/${CONTAINER_ID}")
assert_status "Confirm Deletion (404)" 404 "$HTTP_CODE"

echo ""
echo "=== Results: ${PASS} passed, ${FAIL} failed ==="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
