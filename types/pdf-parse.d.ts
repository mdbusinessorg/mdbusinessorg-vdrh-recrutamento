declare module "pdf-parse" {
  export default function pdfParse(buffer: Buffer): Promise<{ text: string; numpages: number; info: any; metadata: any; version: string }>;
}
