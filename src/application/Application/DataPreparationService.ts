export class DataPreparationService {
    constructor() {}

    /**
     * Reads the blob and returns its base64 string representation.
     */
    public async prepareInputData(file: Blob): Promise<string> {
        const fileData = await this.readFile(file);
        const base64String = this.arrayBufferToBase64(fileData);
        return base64String;
    }

    /** Read blob as ArrayBuffer via FileReader. */
    private readFile(file: Blob): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /** Encode ArrayBuffer as base64 string. */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

}