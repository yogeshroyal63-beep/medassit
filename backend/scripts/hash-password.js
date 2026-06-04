/**
 * Usage: node scripts/hash-password.js <your-plain-password>
 *
 * Outputs the bcrypt hash to paste into ADMIN_PASSWORD in your .env file.
 * bcrypt.compare() in auth.service.js requires ADMIN_PASSWORD to be a real hash.
 *
 * Example:
 *   node scripts/hash-password.js MySecretPass99
 *   -> $2a$12$...  (copy this value into .env as ADMIN_PASSWORD)
 */

const bcrypt = require("bcryptjs");

const plain = process.argv[2];

if (!plain) {
  console.error("Usage: node scripts/hash-password.js <password>");
  process.exit(1);
}

bcrypt.hash(plain, 12).then((hash) => {
  console.log("\nBcrypt hash (paste into .env as ADMIN_PASSWORD):\n");
  console.log(hash);
  console.log();
});
