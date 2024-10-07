import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Upload, Link, Cloud } from 'lucide-react'

interface Props {
  onFileUpload: (files: File[]) => void
  maxFiles: number
  maxSize: number
  acceptedFileTypes: string[]
  filesUploaded: boolean
}

export const FileUploader: React.FC<Props> = ({ 
  onFileUpload, 
  maxFiles, 
  maxSize, 
  acceptedFileTypes, 
  filesUploaded 
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileUpload(acceptedFiles)
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: acceptedFileTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
    maxSize,
  })

  if (filesUploaded) {
    return (
      <div 
        {...getRootProps()} 
        className={`p-3 border border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 flex items-center justify-between ${
          isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 hover:border-primary hover:bg-primary/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex items-center">
          <Cloud size={24} className="text-primary mr-2" />
          <span className="text-sm text-text-light dark:text-text-dark">
            Drag and drop images, Browse, or
          </span>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="text-primary">
            <Link size={16} className="mr-1" />
            Paste URL
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      {...getRootProps()} 
      className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 ${
        isDragActive 
          ? 'border-primary bg-primary/10' 
          : 'border-gray-300 hover:border-primary hover:bg-primary/5'
      }`}
    >
      <input {...getInputProps()} />
      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-text-light dark:text-text-dark">
        Drag and drop images here
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Files supported: JPG | PNG | JPEG | GIF | JFIF
      </p>
      <Button className="bg-primary text-white hover:bg-primary/90">
        + Browse
      </Button>
      <Button variant="ghost" className="ml-2">
        <Link size={16} className="mr-1" />
        Paste URL
      </Button>
    </div>
  )
}