import multer from "multer";
import { v1 as uuidv1 } from "uuid";

const MIME_TYPE_MAP: any = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "application/pdf": "pdf",
};

const fileUpload = multer({
  limits: { fileSize: 100000000 },
  storage: multer.diskStorage({
    destination: (req, file, cb) =>
      cb(
        null,
        process.env.NODE_ENV !== "production"
          ? "src/uploads/images"
          : "build/src/uploads/images"
      ),
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv1() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error: any = isValid ? null : Error(`invalid mime type`);
    cb(error, isValid);
  },
});

export default fileUpload;
