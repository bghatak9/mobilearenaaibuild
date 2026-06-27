// multer@2 ships no types and the @types/multer global augmentation does not
// always merge under @types/express@5. This guarantees `Express.Multer.File`
// is available for `@UploadedFile()` handlers. Merges cleanly with @types/multer.
import 'express';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
        destination?: string;
        filename?: string;
        path?: string;
        stream?: NodeJS.ReadableStream;
      }
    }
  }
}
