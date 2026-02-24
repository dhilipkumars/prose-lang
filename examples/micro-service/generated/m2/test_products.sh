#!/bin/bash
# Product Management API - curl test script
# Usage: ./test_products.sh [BASE_URL]
# Default BASE_URL: http://localhost:8082

BASE_URL="${1:-http://localhost:8082}"
API="${BASE_URL}/api/products"
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

echo "=== Product Management API Tests ==="
echo "Base URL: ${API}"
echo ""

# 1. Create a product
echo "--- CREATE ---"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API}" \
    -H "Content-Type: application/json" \
    -d '{"productName":"Premium Rice","productDescription":"Basmati 5kg","productAmount":12.99,"productQuantity":100}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
assert_status "Create Product" 201 "$HTTP_CODE"
PRODUCT_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['productId'])" 2>/dev/null)
echo "  Created product ID: ${PRODUCT_ID}"

# 2. Get by ID
echo ""
echo "--- GET BY ID ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}/${PRODUCT_ID}")
assert_status "Get Product by ID" 200 "$HTTP_CODE"

# 3. Get non-existent
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}/99999")
assert_status "Get non-existent Product (404)" 404 "$HTTP_CODE"

# 4. Update
echo ""
echo "--- UPDATE ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "${API}/${PRODUCT_ID}" \
    -H "Content-Type: application/json" \
    -d '{"productName":"Updated Rice","productDescription":"Updated desc","productAmount":15.99,"productQuantity":200}')
assert_status "Update Product" 200 "$HTTP_CODE"

# 5. List with pagination
echo ""
echo "--- LIST (PAGINATED) ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}?page=0&size=5")
assert_status "List Products (page 0, size 5)" 200 "$HTTP_CODE"

# 6. List with filter
echo "--- LIST (FILTERED) ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}?productName=Updated")
assert_status "List Products (filter by name)" 200 "$HTTP_CODE"

# 7. Delete
echo ""
echo "--- DELETE ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${API}/${PRODUCT_ID}")
assert_status "Delete Product" 204 "$HTTP_CODE"

# 8. Confirm deletion
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API}/${PRODUCT_ID}")
assert_status "Confirm Deletion (404)" 404 "$HTTP_CODE"

echo ""
echo "=== Results: ${PASS} passed, ${FAIL} failed ==="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
