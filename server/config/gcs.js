import { Storage } from "@google-cloud/storage";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const storage = process.env.GOOGLE_CREDENTIALS
    ? new Storage({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    })
    : new Storage({
        keyFilename: path.join(process.cwd(), "config", "service-account.json"),
    });

const bucketName = process.env.GCS_BUCKET_NAME || "reboot-aicte-uploads"; // Fallback or from env
const bucket = storage.bucket(bucketName);

export { bucket, storage };
