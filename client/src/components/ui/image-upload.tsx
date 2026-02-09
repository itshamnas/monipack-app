import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Loader2, Check, RotateCw, FlipHorizontal, FlipVertical, RotateCcw, ZoomIn, Undo2 } from "lucide-react";
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

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  flipH: boolean,
  flipV: boolean
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.95);
  });
}

const ASPECT_PRESETS = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
] as const;

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
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, flipH, flipV);
    onCropComplete(croppedBlob);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspect(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base font-semibold">{fileName}</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[300px] sm:h-[380px] md:h-[420px] bg-neutral-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
            showGrid
            zoomSpeed={0.3}
            maxZoom={5}
            objectFit="contain"
            style={{
              containerStyle: { borderRadius: 0 },
              mediaStyle: {
                transform: `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
              },
            }}
          />
        </div>

        <div className="px-4 py-3 space-y-3 bg-card border-t">
          <div className="flex flex-wrap gap-1.5">
            {ASPECT_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant={aspect === preset.value ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setAspect(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              value={[zoom]}
              min={1}
              max={5}
              step={0.05}
              onValueChange={(val) => setZoom(val[0])}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10 text-right">{zoom.toFixed(1)}x</span>
          </div>

          <div className="flex items-center gap-3">
            <RotateCw className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={(val) => setRotation(val[0])}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10 text-right">{rotation}°</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                title="Rotate 90° right"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                title="Rotate 90° left"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={flipH ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setFlipH(!flipH)}
                title="Flip horizontal"
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={flipV ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setFlipV(!flipV)}
                title="Flip vertical"
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={handleReset}
                title="Reset all"
              >
                <Undo2 className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSkip}>
                Skip
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-1.5">
                <Check className="h-4 w-4" /> Apply
              </Button>
            </div>
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
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div
            key={url + index}
            className="relative w-24 h-24 rounded-lg border overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <X className="h-3 w-3" />
            </button>
            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {index + 1}
            </span>
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
          Drag & drop images here. Crop, rotate, flip before uploading.
        </p>
      )}

      {currentCropItem && (
        <CropDialog
          open={true}
          imageSrc={currentCropItem.dataUrl}
          fileName={`Crop Image ${currentCropIndex + 1} of ${cropQueue.length}`}
          onClose={handleCropClose}
          onCropComplete={handleCropDone}
          onSkip={handleSkipCrop}
        />
      )}
    </div>
  );
}
