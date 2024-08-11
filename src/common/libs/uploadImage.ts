import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage }).single('file');

async function handleFileUpload(req: Request): Promise<string | null> {
    return new Promise((resolve, reject) => {
        upload(req, {} as any, (err) => {
            if (err) {
                reject(new Error('File upload failed'));
            } else if (req.file) {
                resolve(req.file.path);
            } else {
                resolve(null);
            }
        });
    });
}

export default handleFileUpload;