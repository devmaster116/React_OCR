'use client'
import React, { useCallback, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUploader } from './FileUploader'


import { FileList } from './FileList'
import { Download } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export type FileState = 'idle' | 'uploaded' | 'processing' | 'processed' | 'error'

export interface OCRFile {
  file: File
  state: FileState
  progress: number
  result: string | null
  error?: string
}

const MAX_FREE_FILES = 3
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_FILE_TYPES = ['image/*', 'application/pdf']

const OCRUploader: React.FC = () => {
  const [files, setFiles] = useState<OCRFile[]>([])
  const [overallState, setOverallState] = useState<FileState>('idle')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const addFiles = useCallback((newFiles: File[]) => {
    console.log('addFiles called with', newFiles.length, 'new files')
    console.log('Current files:', files.length)
    
    const totalFiles = files.length + newFiles.length;
    console.log('Total files would be:', totalFiles)
    
    if (totalFiles > MAX_FREE_FILES) {
      console.log('Limit exceeded, showing upgrade modal')
      setShowUpgradeModal(true)
      
      if (files.length < MAX_FREE_FILES) {
        const allowedNewFiles = newFiles.slice(0, MAX_FREE_FILES - files.length)
        console.log('Adding', allowedNewFiles.length, 'files')
        const ocrFiles = allowedNewFiles.map(file => ({
          file,
          state: 'uploaded' as FileState,
          progress: 0,
          result: null
        }))
        setFiles(prev => [...prev, ...ocrFiles])
        setOverallState('uploaded')
      }
    } else {
      console.log('Adding all', newFiles.length, 'files')
      const ocrFiles = newFiles.map(file => ({
        file,
        state: 'uploaded' as FileState,
        progress: 0,
        result: null
      }))
      setFiles(prev => [...prev, ...ocrFiles])
      setOverallState('uploaded')
    }
  }, [files])

  //   const ocrFiles = newFiles.map(file => ({
  //     file,
  //     state: 'uploaded' as FileState,
  //     progress: 0,
  //     result: null
  //   }));
  //   setFiles(prev => [...prev, ...ocrFiles]);
  //   setOverallState('uploaded');
  // }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    if (files.length === 1) {
      setOverallState('idle')
    }
  }

  const updateFileResult = (index: number, newResult: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, result: newResult } : file
    ))
  }

  const processFiles = async () => {
    setOverallState('processing')
    for (let i = 0; i < files.length; i++) {
      if (files[i].state !== 'processed') {
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, state: 'processing' } : f
        ))

        // Simulated OCR process
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 300))
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, progress } : f
          ))
        }

        // Simulate OCR result (replace with actual OCR logic)
        const ocrResult = Math.random() > 0.2 ? `Processed text for ${files[i].file.name}` : ''

        setFiles(prev => prev.map((f, index) => 
          index === i ? { 
            ...f, 
            state: 'processed', 
            progress: 100, 
            result: ocrResult || '**No Text Found**\nYou can try again if you think something is wrong.'
          } : f
        ))
      }
    }
    setOverallState('processed')
  }

  const startOver = () => {
    setFiles([])
    setOverallState('idle')
  }

  const downloadAll = async () => {
    const zip = new JSZip()
    files.forEach((file, index) => {
      if (file.result) {
        zip.file(`${file.file.name.split('.')[0]}_ocr.txt`, file.result)
      }
    })
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "ocr_results.zip")
  }

  return (
    <Card className="p-6 max-w-6xl mx-auto bg-background-light dark:bg-background-dark">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">OCR File Uploader</h2>
        <p className="text-text-light dark:text-text-dark">{files.length} / {MAX_FREE_FILES} Files Uploaded</p>
      </div>
      
      <FileUploader 
        onFileUpload={addFiles} 
        maxFiles={MAX_FREE_FILES}
        maxSize={MAX_FILE_SIZE}
        acceptedFileTypes={ALLOWED_FILE_TYPES}
        filesUploaded={files.length > 0}
      />
      
      <div className="h-[300px] overflow-hidden flex flex-col">
        {files.length > 0 && (
          <FileList 
            files={files} 
            onProcess={processFiles} 
            isProcessing={overallState === 'processing'}
            onRemoveFile={removeFile}
            onUpdateResult={updateFileResult}
          />
        )}
      </div>

      {overallState === 'processed' && (
        <div className="flex justify-between mt-4">
          <Button onClick={startOver} className="bg-primary text-white hover:bg-primary/90">Start Over</Button>
          <Button onClick={downloadAll} className="bg-primary text-white hover:bg-primary/90">
            <Download size={16} className="mr-2" /> Download All
          </Button>
        </div>
      )}

      {overallState !== 'processed' && files.length > 0 && !overallState.includes('processing') && (
        <Button onClick={processFiles} className="w-full mt-4 bg-primary text-white hover:bg-primary/90">
          Process Files
        </Button>
      )}

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
          <DialogHeader>
            <DialogTitle>Limit Exceeded</DialogTitle>
            <DialogDescription>
              Free users can upload up to 3 Images
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>⭐ Upload up to 50 images (per submission).</p>
            <p>⭐ Get Ad free conversions.</p>
            <p>⭐ Get priority support.</p>
            <p>⭐ Get Premium dashboard and Support.</p>
            <p>⭐ Upload image size up to 15MB.</p>
            <p>⭐ reCaptcha free access.</p>
          </div>
          <Button onClick={() => setShowUpgradeModal(false)} className="w-full mt-4 bg-primary text-white hover:bg-primary/90">
            $3.50 Get Premium
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default OCRUploader