import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Loader2, Crop, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxFiles?: number;
  minFiles?: number;
  className?: string;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      "image/jpeg",
      0.95
    );
  });
}

interface CropDialogProps {
  open: boolean;
  imageSrc: string;
  fileName: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  onSkip: () => void;
}

function CropDialog({ open, imageSrc, fileName, onClose, onCropComplete, onSkip }: CropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(croppedBlob);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg sm:max-w-xl md:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base">Crop Image: {fileName}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[350px] sm:h-[400px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            showGrid
          />
        </div>
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Zoom</span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(val) => setZoom(val[0])}
              className="flex-1"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onSkip}>
              Skip Crop
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-1">
              <Check className="h-4 w-4" /> Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ImageUpload({
  value,
  onChange,
  maxFiles = 10,
  minFiles = 0,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const [cropQueue, setCropQueue] = useState<{ file: File; dataUrl: string }[]>([]);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);

  const startCropping = (files: File[]) => {
    const readers = files.map(
      (file) =>
        new Promise<{ file: File; dataUrl: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ file, dataUrl: reader.result as string });
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((results) => {
      setCropQueue(results);
      setProcessedFiles([]);
      setCurrentCropIndex(0);
    });
  };

  const handleCropDone = async (croppedBlob: Blob) => {
    const currentItem = cropQueue[currentCropIndex];
    const croppedFile = new File([croppedBlob], currentItem.file.name, {
      type: "image/jpeg",
    });

    const newProcessed = [...processedFiles, croppedFile];
    setProcessedFiles(newProcessed);

    if (currentCropIndex + 1 < cropQueue.length) {
      setCurrentCropIndex(currentCropIndex + 1);
    } else {
      setCropQueue([]);
      setCurrentCropIndex(0);
      await uploadFiles(newProcessed);
    }
  };

  const handleSkipCrop = async () => {
    const currentItem = cropQueue[currentCropIndex];
    const newProcessed = [...processedFiles, currentItem.file];
    setProcessedFiles(newProcessed);

    if (currentCropIndex + 1 < cropQueue.length) {
      setCurrentCropIndex(currentCropIndex + 1);
    } else {
      setCropQueue([]);
      setCurrentCropIndex(0);
      await uploadFiles(newProcessed);
    }
  };

  const handleCropClose = () => {
    setCropQueue([]);
    setCurrentCropIndex(0);
    setProcessedFiles([]);
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const res = await apiFetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Upload failed");
      }

      const { urls } = await res.json();
      onChange([...value, ...urls]);
      toast({ title: "Success", description: "Images uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxFiles) {
        toast({
          title: "Error",
          description: `Maximum ${maxFiles} images allowed`,
          variant: "destructive",
        });
        return;
      }

      startCropping(acceptedFiles);
    },
    [value, maxFiles, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: isUploading || cropQueue.length > 0,
  });

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const currentCropItem = cropQueue[currentCropIndex];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div
            key={url + index}
            className="relative w-24 h-24 rounded-lg border overflow-hidden group shadow-sm"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-destructive/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {value.length < maxFiles && (
          <div
            {...getRootProps()}
            className={cn(
              "w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
              isDragActive
                ? "border-primary bg-primary/5 scale-105"
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {isDragActive ? "Drop here" : "Upload"}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {minFiles > 0 && value.length < minFiles && (
        <p className="text-xs text-destructive font-medium animate-pulse">
          Minimum {minFiles} images required (current: {value.length})
        </p>
      )}

      {!isDragActive && !isUploading && value.length < maxFiles && (
        <p className="text-[11px] text-muted-foreground italic">
          Tip: Drag & drop images here. You can crop each image before uploading.
        </p>
      )}

      {currentCropItem && (
        <CropDialog
          open={true}
          imageSrc={currentCropItem.dataUrl}
          fileName={`Image ${currentCropIndex + 1} of ${cropQueue.length}`}
          onClose={handleCropClose}
          onCropComplete={handleCropDone}
          onSkip={handleSkipCrop}
        />
      )}
    </div>
  );
}
