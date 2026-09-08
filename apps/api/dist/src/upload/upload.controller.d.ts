export declare class UploadController {
    upload(file?: Express.Multer.File): {
        url: string;
        mimeType: string;
        size: number;
    };
}
