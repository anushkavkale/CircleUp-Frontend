import React, {useEffect} from 'react'
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react"

import { useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"

export default function Component({onFileSelect}) {
  const maxSizeMB = 50
  const maxSize = maxSizeMB * 1024 * 1024

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,video/mp4,video/webm,video/ogg",
    maxSize,
  })
  useEffect(() => {
    if (onFileSelect) {
      onFileSelect(files[0]?.file || null);
    }
  }, [files, onFileSelect]);

  const previewUrl = files[0]?.preview || null
  const selectedFile = files[0]?.file || null
  const isVideo = selectedFile?.type.startsWith("video/")

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="w-[350px] border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]">
          <input {...getInputProps()} className="sr-only" aria-label="Upload image or video file" />
          {previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {isVideo ? (
                <video src={previewUrl} controls className="mx-auto max-h-full rounded object-contain" />
              ) : (
                <img
                  src={previewUrl}
                  alt={selectedFile?.name || "Uploaded image"}
                  className="mx-auto max-h-full rounded object-contain" />
              )}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true">
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">Drop an image or video here</p>
              <p className="text-muted-foreground text-xs">
                Images or MP4, WebM, OGG videos (max. {maxSizeMB}MB)
              </p>
              <Button variant="outline" className="mt-4" onClick={openFileDialog}>
                <UploadIcon className="-ms-1 size-4 opacity-60" aria-hidden="true" />
                Select media
              </Button>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={() => removeFile(files[0]?.id)}
              aria-label="Remove media">
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      {errors.length > 0 && (
        <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
