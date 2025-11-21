const fetch = require('node-fetch');

async function verify() {
    try {
        console.log("Testing /admin/6.1.2.1.1...");
        const res1 = await fetch('http://localhost:3000/admin/6.1.2.1.1');
        const data1 = await res1.json();

        if (data1.CAY && data1.CAYm1 && data1.CAYm2 && data1.CAYm3) {
            console.log("SUCCESS: 6.1.2.1.1 returns CAY, CAYm1, CAYm2, CAYm3");
            console.log("CAY count:", data1.CAY.length);
        } else {
            console.error("FAILURE: 6.1.2.1.1 missing keys", Object.keys(data1));
        }

        console.log("Testing /admin/6.1.2.2.1...");
        const res2 = await fetch('http://localhost:3000/admin/6.1.2.2.1');
        const data2 = await res2.json();

        if (data2.CAY && data2.CAYm1 && data2.CAYm2 && data2.CAYm3) {
            console.log("SUCCESS: 6.1.2.2.1 returns CAY, CAYm1, CAYm2, CAYm3");
            if (data2.CAY.length > 0) {
                console.log("Sample CAY row marks:", data2.CAY[0].marks);
            }
        } else {
            console.error("FAILURE: 6.1.2.2.1 missing keys", Object.keys(data2));
        }

    } catch (err) {
        console.error("Verification failed:", err);
    }
}

verify();
