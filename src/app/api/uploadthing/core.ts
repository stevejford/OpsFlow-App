import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Simple auth function - replace with your own
const auth = (req: Request) => ({ id: "authenticated-user" }); 

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Document uploader for employee documents
  documentUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    text: { maxFileSize: "2MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth(req);
      
      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");
      
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      
      // Return data to the client
      return { fileUrl: file.url, fileName: file.name, fileKey: file.key };
    }),
  
  // License uploader for employee licenses and certifications
  licenseUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("License upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { fileUrl: file.url, fileName: file.name, fileKey: file.key };
    }),
  
  // Induction uploader for employee inductions and training
  inductionUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Induction upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { fileUrl: file.url, fileName: file.name, fileKey: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
