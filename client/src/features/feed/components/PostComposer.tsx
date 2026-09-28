import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { ImagePlus, X } from "lucide-react";
import { useCreatePost } from "../hooks/usePosts";
import { Button } from "../../../components/common/Button";

export function PostComposer() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createPost, isPending } = useCreatePost();

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remainingSlots = 4 - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const compressed = await Promise.all(
      filesToAdd.map((file) => imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600 }))
    );

    setImages((prev) => [...prev, ...compressed]);
    setPreviews((prev) => [...prev, ...compressed.map((file) => URL.createObjectURL(file))]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim() && images.length === 0) return;

    createPost(
      { content, images },
      {
        onSuccess: () => {
          setContent("");
          setImages([]);
          setPreviews([]);
        },
      }
    );
  };

  return (
    <div className="rounded-[10px] border border-line bg-white p-5">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Bạn đang nghĩ gì?"
        rows={3}
        className="w-full resize-none border-0 bg-transparent font-sans text-[15px] text-ink outline-none placeholder:text-ink/30"
      />

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {previews.map((src, index) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-[8px]">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= 4}
          className="flex items-center gap-1.5 text-ink/50 hover:text-coral disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ImagePlus size={20} />
          <span className="font-sans text-xs">{images.length}/4</span>
        </button>

        <Button
          className="w-auto px-5 py-2"
          isLoading={isPending}
          disabled={!content.trim() && images.length === 0}
          onClick={handleSubmit}
        >
          Đăng bài
        </Button>
      </div>
    </div>
  );
}
