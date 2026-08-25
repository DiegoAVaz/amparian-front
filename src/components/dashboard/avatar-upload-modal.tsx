"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  Avatar,
  Button,
  FormAlert,
  IconButton,
  ImageUploadField,
} from "@/components/ui";
import {
  deleteMyAvatar,
  uploadMyAvatar,
  type UserProfile,
} from "@/lib/amparian-api";
import { ApiError } from "@/lib/api";

type Props = {
  name: string;
  savedUrl?: string | null;
  onSaved: (profile: UserProfile) => void;
  onClose: () => void;
};

export function AvatarUploadModal({ name, savedUrl, onSaved, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const savedOrRemoved = removed ? null : (savedUrl ?? null);
  const shownUrl = preview ?? savedOrRemoved;
  const hasPendingChange = Boolean(file) || removed;

  function handleSelect(nextFile: File | null) {
    setFile(nextFile);
    setPreview(nextFile ? URL.createObjectURL(nextFile) : null);
    if (nextFile) setRemoved(false);
    setError("");
  }

  function handleRemove() {
    setFile(null);
    setPreview(null);
    setRemoved(Boolean(savedUrl));
    setError("");
  }

  async function handleConfirm() {
    if (!hasPendingChange) {
      onClose();
      return;
    }

    const action = file ? "enviar" : "remover";
    setSaving(true);
    setError("");

    let next: UserProfile;
    try {
      next = file ? await uploadMyAvatar(file) : await deleteMyAvatar();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : `Não foi possível ${action} a foto.`,
      );
      setSaving(false);
      return;
    }
    onSaved(next);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-foto-titulo"
    >
      <div className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl sm:p-6">
        <IconButton
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-transparent hover:text-gray-500"
          icon={<X size={16} strokeWidth={2} aria-hidden="true" />}
          label="Fechar"
          onClick={onClose}
          disabled={saving}
          size="sm"
          variant="ghost"
        />

        <h2
          id="modal-foto-titulo"
          className="text-lg font-bold text-brand-teal"
        >
          Foto de perfil
        </h2>

        <div className="mt-6 flex flex-col items-center gap-5">
          <Avatar name={name} src={shownUrl} size="md" />

          <div className="w-full">
            <ImageUploadField
              label="Escolher nova foto"
              currentUrl={savedOrRemoved}
              onSelect={handleSelect}
              onRemove={handleRemove}
              disabled={saving}
            />
          </div>
        </div>

        <FormAlert variant="error">{error}</FormAlert>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={saving}
            loading={saving}
            loadingLabel={file ? "Enviando..." : "Removendo..."}
          >
            Concluir
          </Button>
        </div>
      </div>
    </div>
  );
}

