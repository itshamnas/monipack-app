import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxFiles?: number;
  minFiles?: number;
  className?: string;
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

      setIsUploading(true);
      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("images", file));

      try {
        const res = await apiFetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const { urls } = await res.json();
        onChange([...value, ...urls]);
        toast({ title: "Success", description: "Images uploaded successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload images",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [value, onChange, maxFiles, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: isUploading,
  });

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

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
          Tip: You can drag and drop multiple images here
        </p>
      )}
    </div>
  );
}
