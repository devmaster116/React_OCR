import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import sharp from 'sharp';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });




console.log('Environment Variables:');
console.log('GOOGLE_CLOUD_CLIENT_EMAIL:', process.env.GOOGLE_CLOUD_CLIENT_EMAIL);
console.log('GOOGLE_CLOUD_PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
console.log('GOOGLE_CLOUD_PRIVATE_KEY (length):', process.env.GOOGLE_CLOUD_PRIVATE_KEY?.length);
// Set GRPC SSL cipher suites
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_DIMENSION = 4000; // Max width or height in pixels

let visionClient: ImageAnnotatorClient | null = null;

try {
    visionClient = new ImageAnnotatorClient({
        credentials: {
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });
  console.log('Vision client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Google Cloud Vision client:', error);
}

async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (metadata.width && metadata.width > MAX_IMAGE_DIMENSION ||
      metadata.height && metadata.height > MAX_IMAGE_DIMENSION) {
    return image.resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true
    }).toBuffer();
  }

  return buffer;
}

export async function POST(request: NextRequest) {
  console.log("POST request received at /api/ocr");

  if (!visionClient) {
    console.error('Vision client is not initialized');
    return NextResponse.json({ error: 'OCR service is not available' }, { status: 500 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let file: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      file = formData.get('file') as File | null;
    } else if (contentType === 'application/octet-stream') {
      const buffer = await request.arrayBuffer();
      file = new File([buffer], 'upload.jpg', { type: 'image/jpeg' });
    } else {
      console.error(`Unsupported Content-Type: ${contentType}`);
      return NextResponse.json({ error: `Unsupported Content-Type: ${contentType}. Use multipart/form-data or application/octet-stream.` }, { status: 400 });
    }

    if (!file) {
      console.error('No file provided');
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    console.log(`File received: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

    if (file.size > MAX_FILE_SIZE) {
      console.error(`File size (${file.size}) exceeds limit (${MAX_FILE_SIZE})`);
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`);
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    console.log("Starting file processing");
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    buffer = await preprocessImage(buffer);
    console.log("File preprocessed");

    console.log("Starting OCR recognition");
    const [result] = await visionClient.documentTextDetection(buffer);
    console.log("OCR recognition complete");

    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      console.log("No text detected in the image");
      return NextResponse.json({ 
        text: 'No text detected in the image.',
        confidence: 0,
        detectedLanguage: 'unknown',
        boundingBoxes: []
      });
    }

    const text = detections[0].description || '';
    const confidence = detections[0].confidence || 0;
    const detectedLanguage = result.fullTextAnnotation?.pages?.[0]?.property?.detectedLanguages?.[0]?.languageCode || 'unknown';

    const boundingBoxes = detections.slice(1).map(detection => ({
      text: detection.description,
      boundingBox: detection.boundingPoly?.vertices
    }));

    console.log("Sending response");
    return NextResponse.json({ text, confidence, detectedLanguage, boundingBoxes });
  } catch (error: unknown) {
    console.error('OCR Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `An error occurred during text extraction: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred during text extraction.' }, { status: 500 });
    }
  }
}

export async function GET() {
  return NextResponse.json({ message: "OCR endpoint is working. Please use POST to submit an image." });
}
