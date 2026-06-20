export const MAX_UPLOAD_IMAGE_SIZE = 5 * 1024 * 1024;

export function normalizeUploadFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-");
}

export function isUploadFile(
  value: FormDataEntryValue | null,
): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function"
  );
}

export function getImageMimeType(file: File) {
  if (file.type.startsWith("image/")) {
    return file.type;
  }

  const extension = normalizeUploadFileName(file.name).split(".").pop();

  switch (extension) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return null;
  }
}