import { calculateCAY } from './server/utils/cay.js';

console.log("Testing calculateCAY()...");
const result = calculateCAY();
console.log("Result:", JSON.stringify(result, null, 2));

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();
const expectedStart = currentMonth >= 7 ? currentYear : currentYear - 1;
const expectedCAY = `${expectedStart}-${String(expectedStart + 1).slice(2)}`;

if (result.CAY === expectedCAY) {
    console.log("SUCCESS: CAY matches expected logic.");
} else {
    console.error(`FAILURE: Expected ${expectedCAY}, got ${result.CAY}`);
}
