# Security Specification & Threat Model for STZ Fashion

## 1. Data Invariants

1. **Owner-Only Identity Barrier**: Only the authenticated store owner with email `halifinakungcr24@gmail.com` and a verified Google token (`email_verified == true`) is allowed read, write, update, and delete operations.
2. **Item ID Invariant**: Every inventory item must possess a unique, valid alphanumeric identifier (`^[a-zA-Z0-9_-]+$`) with a maximum length of 128 characters.
3. **Non-Negative Stock & Quantities**: Current stock, min stock, buy price, sell price, and transaction quantities must be numbers. Stock mutations cannot introduce negative or corrupted values.
4. **Immutable Transaction History**: Once written, transaction records (`/transactions/{transactionId}`) are append-only audit entries that cannot be altered or falsified.
5. **No Blind Privilege Escalation**: Settings and PIN configurations are strictly constrained to the authorized owner and cannot be accessed or modified by unauthenticated or third-party users.
6. **Strict Schema Integrity**: Payloads containing unwhitelisted ghost fields or oversized arbitrary inputs (> 128 characters for IDs, > 500 characters for descriptions) are rejected immediately.

---

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Payload 1: Unauthenticated Read Attempt**
   - Target: `GET /items/item_dress_001`
   - Request Auth: `null`
   - Expected Result: `PERMISSION_DENIED`

2. **Payload 2: Unauthenticated Write / Infiltration**
   - Target: `SET /items/hack_001`
   - Data: `{ "name": "Fake Item", "color": "Red", "size": "M", "currentStock": 100 }`
   - Request Auth: `null`
   - Expected Result: `PERMISSION_DENIED`

3. **Payload 3: Non-Owner Authenticated Read (Identity Spoofing)**
   - Target: `GET /items/item_dress_001`
   - Request Auth: `{ uid: "stranger123", token: { email: "attacker@gmail.com", email_verified: true } }`
   - Expected Result: `PERMISSION_DENIED`

4. **Payload 4: Non-Owner Write (Privilege Escalation)**
   - Target: `CREATE /items/item_hijack`
   - Request Auth: `{ uid: "stranger123", token: { email: "attacker@gmail.com", email_verified: true } }`
   - Expected Result: `PERMISSION_DENIED`

5. **Payload 5: Spoofed Unverified Email Attempt**
   - Target: `GET /items/item_dress_001`
   - Request Auth: `{ uid: "spoof_uid", token: { email: "halifinakungcr24@gmail.com", email_verified: false } }`
   - Expected Result: `PERMISSION_DENIED`

6. **Payload 6: Denial of Wallet / Oversized ID Attack (ID Poisoning)**
   - Target: `SET /items/a-very-long-string-over-128-chars-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
   - Request Auth: `{ uid: "owner_uid", token: { email: "halifinakungcr24@gmail.com", email_verified: true } }`
   - Expected Result: `PERMISSION_DENIED`

7. **Payload 7: Shadow Field / Ghost Property Injection**
   - Target: `CREATE /items/item_ghost_01`
   - Data: `{ "id": "item_ghost_01", "name": "Baju Baru", "color": "Hitam", "size": "L", "currentStock": 10, "adminOverridePrivilege": true }`
   - Expected Result: `PERMISSION_DENIED`

8. **Payload 8: Mutating Immutable Transaction Audit Entry**
   - Target: `UPDATE /transactions/trx_001`
   - Data: `{ "quantity": 9999 }`
   - Request Auth: `{ uid: "owner_uid", token: { email: "halifinakungcr24@gmail.com", email_verified: true } }`
   - Expected Result: `PERMISSION_DENIED` (Transactions are write-once / append-only logs)

9. **Payload 9: Deleting Store Settings Document**
   - Target: `DELETE /settings/store`
   - Expected Result: `PERMISSION_DENIED` (Settings document cannot be deleted)

10. **Payload 10: Negative Stock / Type Poisoning Injection**
    - Target: `CREATE /items/item_neg`
    - Data: `{ "id": "item_neg", "name": "Baju", "color": "Biru", "size": "XL", "currentStock": "NOT_A_NUMBER" }`
    - Expected Result: `PERMISSION_DENIED`

11. **Payload 11: Blanket Catch-All Escape Hatch**
    - Target: `GET /secret_collection/random_doc`
    - Request Auth: `{ uid: "owner_uid", token: { email: "halifinakungcr24@gmail.com", email_verified: true } }`
    - Expected Result: `PERMISSION_DENIED`

12. **Payload 12: List Scraping Without Matching Owner Claim**
    - Target: `LIST /items`
    - Request Auth: `{ uid: "unauthorized_user", token: { email: "random@domain.com", email_verified: true } }`
    - Expected Result: `PERMISSION_DENIED`
