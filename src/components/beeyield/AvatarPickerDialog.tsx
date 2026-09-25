import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Check,
  Camera,
  Sparkles,
  Loader2,
  Trash2,
  ShieldCheck,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PRESET_AVATARS, type PresetAvatar, TIMOTHY_DEFAULT_AVATAR } from "@/lib/preset-avatars";
import { uploadAvatar, saveUserAvatar } from "@/services/beeyieldService";
import { useAuth } from "@/hooks/use-auth";

interface AvatarPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  userName?: string;
  userId?: string;
}

export const AvatarPickerDialog: React.FC<AvatarPickerDialogProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  userName = "Timothy",
  userId,
}) => {
  const { user, profile, updateAvatar } = useAuth();
  const effectiveUserId = userId || user?.id || profile?.id || "usr_kibwezi_owner_01";

  const [activeTab, setActiveTab] = useState<"preset" | "upload">("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    const found = PRESET_AVATARS.find((p) => p.svg === currentAvatarUrl);
    return found ? found.id : PRESET_AVATARS[0].id;
  });
  const [categoryFilter, setCategoryFilter] = useState<"all" | "role" | "nature" | "equipment">("all");

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredPresets = PRESET_AVATARS.filter((p) => {
    if (categoryFilter === "all") return true;
    return p.category === categoryFilter;
  });

  const handleSelectPreset = async (preset: PresetAvatar) => {
    setSelectedPresetId(preset.id);
  };

  const handleApplyPreset = async () => {
    const preset = PRESET_AVATARS.find((p) => p.id === selectedPresetId);
    if (!preset) return;

    setIsUploading(true);
    try {
      await saveUserAvatar(effectiveUserId, preset.svg);
      await updateAvatar(preset.svg);
      toast.success(`Avatar updated to "${preset.name}"!`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, GIF)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setUploadFile(file);
    const objectUrl = URL.createObjectURL(file);
    setUploadPreview(objectUrl);
  };

  const handleUploadPhoto = async () => {
    if (!uploadFile) {
      toast.error("Please choose a photo to upload first");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadAvatar(effectiveUserId, uploadFile);
      if (res.url) {
        await updateAvatar(res.url);
        toast.success("Profile photo uploaded and saved successfully!");
        onClose();
      } else {
        toast.error("Failed to upload photo. Please try again.");
      }
    } catch (err) {
      console.error("Upload photo error:", err);
      toast.error("Error uploading photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
      await saveUserAvatar(effectiveUserId, "");
      await updateAvatar("");
      toast.success("Profile photo removed. Restored initial avatar.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const activeDisplayAvatar =
    activeTab === "upload" && uploadPreview
      ? uploadPreview
      : PRESET_AVATARS.find((p) => p.id === selectedPresetId)?.svg || currentAvatarUrl || TIMOTHY_DEFAULT_AVATAR;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in-0 duration-200">
      <div
        className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-[#1C1917] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Profile Avatar & Photo
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Backend Synced
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Choose a handcrafted apiculture badge or upload your personal portrait
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Active Preview Banner */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/15 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-md flex-shrink-0 overflow-hidden">
                {activeDisplayAvatar ? (
                  <img
                    src={activeDisplayAvatar}
                    alt={userName}
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                ) : (
                  <div className="w-full h-full rounded-[14px] bg-amber-500 flex items-center justify-center text-white font-black text-xl">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1C1917]" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{userName}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                Verified Apiary Owner • Kibwezi, Kenya
              </p>
            </div>
          </div>

          {currentAvatarUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Reset to default initial"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )}
        </div>

        {/* Tabs: Choose Avatar vs Upload Photo */}
        <div className="flex items-center gap-1 p-2 mx-5 mt-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setActiveTab("preset")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "preset"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Choose an Avatar ({PRESET_AVATARS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "upload"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-500" />
            Upload Photo / Image
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === "preset" && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(
                  [
                    { id: "all", label: "All Avatars" },
                    { id: "role", label: "Beekeeper Roles" },
                    { id: "nature", label: "Flora & Colony" },
                    { id: "equipment", label: "Smart Gear & IoT" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${
                      categoryFilter === cat.id
                        ? "bg-amber-500 text-white font-bold shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of Preset Avatars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                        isSelected
                          ? "bg-amber-50/80 dark:bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-[1.02]"
                          : "bg-stone-50/50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500/40 hover:bg-amber-50/30"
                      }`}
                    >
                      {/* Avatar Graphic */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform mb-2">
                        <img src={preset.svg} alt={preset.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Name & Role */}
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate w-full">
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate w-full mt-0.5">
                        {preset.role}
                      </p>

                      {/* Selection Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-4">
              {/* Dropzone / Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-stone-50/40 dark:bg-stone-900/30 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 group flex flex-col items-center justify-center"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {uploadPreview ? (
                  <div className="space-y-3">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto shadow-lg ring-4 ring-amber-500/20 group-hover:scale-105 transition-transform">
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {uploadFile?.name}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        {((uploadFile?.size || 0) / 1024).toFixed(1)} KB • Click to choose a different photo
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Click or drag a photo here to upload
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Supports PNG, JPG, WEBP or GIF up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Tips */}
              <div className="p-3.5 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Your photo will be automatically optimized, synchronized across Supabase profiles, and displayed on your harvest certificates, inspection sign-offs, and dashboard headers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Cancel
          </button>

          {activeTab === "preset" ? (
            <button
              type="button"
              onClick={handleApplyPreset}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Avatar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUploadPhoto}
              disabled={isUploading || !uploadFile}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Upload & Save Photo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerDialog;
