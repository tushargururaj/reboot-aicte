
import { analyzeCertificateWithAI } from './services/ai.service.js';

// Mock FDP Text
const mockFDPText = `
CERTIFICATE OF PARTICIPATION
This is to certify that Dr. John Doe
has successfully participated in the 5-Day Faculty Development Program
on "Advanced AI in Education"
Organized by IIT Bombay
Held from 10th July 2024 to 15th July 2024.
Mode: Online
`;

// Mock Membership Text
const mockMembershipText = `
IEEE
The world's largest technical professional organization.
MEMBERSHIP CARD
Name: Jane Smith
Member Grade: Senior Member
Membership Number: 98765432
Valide thru: 31 Dec 2025
`;

async function runTest() {
    try {
        console.log('--- Testing FDP ---');
        const fdpResult = await analyzeCertificateWithAI(mockFDPText);
        console.log('Detected Type:', fdpResult.detectedType);
        console.log('Fields:', Object.keys(fdpResult.extractedFields));
        console.log('Extracted Data:', JSON.stringify(fdpResult.extractedFields, null, 2));

        console.log('\n--- Testing Membership ---');
        const memResult = await analyzeCertificateWithAI(mockMembershipText);
        console.log('Detected Type:', memResult.detectedType);
        console.log('Fields:', Object.keys(memResult.extractedFields));
        console.log('Extracted Data:', JSON.stringify(memResult.extractedFields, null, 2));

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

runTest();
