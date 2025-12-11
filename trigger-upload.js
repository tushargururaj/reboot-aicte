
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const filePath = 'C:/Users/HARSH/.gemini/antigravity/brain/2453d827-6f21-4448-99b2-bae76d8d69ac/uploaded_image_0_1765380247105.png';

async function testUpload() {
    try {
        const form = new FormData();
        form.append('certificate', fs.createReadStream(filePath));

        console.log('Sending request to http://localhost:3000/api/ai-upload/process');

        const response = await axios.post('http://localhost:3000/api/ai-upload/process', form, {
            headers: {
                ...form.getHeaders()
            },
            validateStatus: status => true // Don't throw on error status
        });

        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testUpload();
