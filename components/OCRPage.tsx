import OCRUploader from '@/components/OCRUploader'

export default function OCRPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Image to Text Converter</h1>
      <h2 className="text-lime-950 mb-8 text-center">Convert JPG, PNG, and more into editable text with our free Image to Text Converter. Easily handle multiple images at once and get accurate results.
</h2>
      <OCRUploader />
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold mb-2">Tips for Best Results:</h2>
        <ul className="list-disc list-inside">
          <li>Ensure good lighting when taking a photo of the text</li>
          <li>Capture the entire text area in the image</li>
          <li>Avoid shadows and glare on the text</li>
          <li>Keep the camera steady to avoid blurry images</li>
          <li>For best results, use high-contrast text (e.g., black text on white background)</li>
        </ul>
      </div>
    </div>
  )
}