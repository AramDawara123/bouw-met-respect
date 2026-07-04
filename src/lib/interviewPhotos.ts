import { supabase } from "@/integrations/supabase/client";

const INTERVIEW_PHOTOS_BUCKET = "interview-photos";

export const getInterviewPhotoStoragePath = (value?: string | null) => {
  const source = value?.trim();
  if (!source) return null;

  if (source.startsWith("/lovable-uploads/") || source.startsWith("data:")) {
    return null;
  }

  if (!source.startsWith("http://") && !source.startsWith("https://") && !source.startsWith("/")) {
    return source.startsWith(`${INTERVIEW_PHOTOS_BUCKET}/`)
      ? source.slice(INTERVIEW_PHOTOS_BUCKET.length + 1)
      : source;
  }

  try {
    const url = new URL(source);
    const marker = `/storage/v1/object/public/${INTERVIEW_PHOTOS_BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) return null;

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

export const getInterviewPhotoDisplayUrl = async (value?: string | null) => {
  const path = getInterviewPhotoStoragePath(value);
  if (!path) return value || "";

  const { data, error } = await supabase.storage
    .from(INTERVIEW_PHOTOS_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24);

  return error ? value || "" : data.signedUrl;
};
