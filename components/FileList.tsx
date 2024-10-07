// FileList.tsx
import React from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { OCRFile, FileState } from './OCRUploader'
import { Copy, Download, X } from 'lucide-react'
import { toast } from "sonner"

interface Props {
  files: OCRFile[]
  onProcess: () => void
  isProcessing: boolean
  onRemoveFile: (index: number) => void
  onUpdateResult: (index: number, newResult: string) => void
}

export const FileList: React.FC<Props> = ({ 
    files, 
    onProcess, 
    isProcessing, 
    onRemoveFile, 
    onUpdateResult 
  }) => {
    const getProgressColor = (state: FileState) => {
      switch (state) {
        case 'processed': return 'bg-success'
        case 'error': return 'bg-error'
        default: return 'bg-info'
      }
    }

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
    <div className="space-y-4 overflow-y-auto flex-grow">
      {files.map((file, index) => (
        <div key={index} className="flex items-start space-x-4 bg-background-light dark:bg-background-dark p-4 rounded-lg mb-4">
          <div className="flex-shrink-0 w-1/4">
            <div className="relative">
              <div className="w-full h-20 overflow-hidden rounded">
                {file.file.type.startsWith('image/') ? (
                  <img 
                    src={URL.createObjectURL(file.file)} 
                    alt={file.file.name} 
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-text-light dark:text-text-dark">PDF</span>
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onRemoveFile(index)}
                className="absolute top-0 left-0 bg-white bg-opacity-50 hover:bg-opacity-100 transition-opacity"
              >
                <X size={16} className="text-error" />
              </Button>
            </div>
            <p className="font-semibold mt-2 truncate text-text-light dark:text-text-dark">{file.file.name}</p>
            <div className="flex items-center mt-2">
              <Progress 
                value={file.progress} 
                className={`flex-grow h-1.5 ${getProgressColor(file.state)}`}
              />
              <span className="ml-2 text-sm text-text-light dark:text-text-dark">{file.progress}%</span>
            </div>
          </div>
          <div className="flex-grow">
            <p className="text-sm mb-2 text-text-light dark:text-text-dark">{file.state}</p>
            {file.result !== null && (
              <>
                <Textarea
                  value={file.result}
                  onChange={(e) => onUpdateResult(index, e.target.value)}
                  className="w-full h-32 mb-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                />
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyText(file.result!)}
                    className="mr-2 bg-primary text-white hover:bg-primary/90"
                  >
                    <Copy size={14} className="mr-1" /> Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadText(file.result!, file.file.name)}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <Download size={14} className="mr-1" /> Download
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}