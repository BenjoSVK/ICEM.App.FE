/** Single TIFF file row in the list (id, name, date, size, status, optional taskId). */
export interface TiffRecord {
    id: string;
    name: string;
    date: string;
    size: string;
    status: string;
    taskId?: string;
}

/** Single GeoJSON result row (id, name, date, size, type tissue|cell). */
export interface GeoJSONRecord {
    id: string;
    name: string;
    date: string;
    size: string;
    type: "tissue" | "cell";
}