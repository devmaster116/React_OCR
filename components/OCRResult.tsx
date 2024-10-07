import React from 'react'
import { Button } from "@/components/ui/button"
import { Copy, Download } from 'lucide-react'
import { toast } from "sonner"
import { OCRFile } from './OCRUploader'

interface Props {
  files: OCRFile[]
}

export const OCRResult: React.FC<Props> = ({ files }) => {
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Text copied to clipboard")
  }

  const downloadText = (text: string, fileName: string) => {
    const element = document.createElement("a")
    const file = new Blob([text], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `${fileName.split('.')[0]}_ocr.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="mt-8">
      {files.map((file, index) => (
        file.result && (
          <div key={index} className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{file.file.name} - OCR Result</h3>
              <div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyText(file.result!)}
                >
                  <Copy size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="ml-2"
                  onClick={() => downloadText(file.result!, file.file.name)}
                >
                  <Download size={16} />
                </Button>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{file.result}</p>
            </div>
          </div>
        )
      ))}
    </div>
  )
}