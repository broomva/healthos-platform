export const imageDocumentHandler = {
  kind: "image" as const,
  onCreateDocument: async ({
    title,
    dataStream,
  }: { title: string; dataStream: any }) => {
    dataStream.writeData({ type: "data-imageDelta", content: "" });
    // TODO: Integrate DALL-E or Stable Diffusion API
    return `Image artifact "${title}" - generation pending API integration`;
  },
};
