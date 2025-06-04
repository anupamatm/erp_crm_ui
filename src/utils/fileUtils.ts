export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const filesToBase64 = async (files: File[]): Promise<string[]> => {
  const base64Files = await Promise.all(files.map(file => fileToBase64(file)));
  return base64Files;
};
