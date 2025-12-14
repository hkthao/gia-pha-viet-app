import { File, Paths } from 'expo-file-system';
import { Buffer } from 'buffer';

interface UploadFileArgs {
  base64Content: string;
  fileName: string;
  mediaType: string;
  familyId: string;
  folder: string;
  uploadMutation: any; // Use a more specific type if available, e.g., UseMutationResult for the upload mutation
}

export async function createAndUploadFile({
  base64Content,
  fileName,
  mediaType,
  familyId,
  folder,
  uploadMutation,
}: UploadFileArgs): Promise<string> {
  const file = new File(Paths.cache, fileName);
  const bytes = Uint8Array.from(Buffer.from(base64Content, 'base64'));

  await file.create({ overwrite: true });
  await file.write(bytes);

  const uploadedUrl = await uploadMutation.mutateAsync({
    file: {
      uri: file.uri,
      name: fileName,
      type: mediaType,
    },
    familyId: familyId,
    folder: folder,
  });

  await file.delete();
  return uploadedUrl;
}
