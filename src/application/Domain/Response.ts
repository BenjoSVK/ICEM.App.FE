/** API response for GET /get-tiff-files. */
export interface TiffFileResponse {
    tiff_files: {
      id: string;
      last_modified: string;
      size_bytes: number;
    }[];
}

/** API response for GET /get-geojson-files. */
export interface GeoJSONFileResponse {
    geojson_files: {
      id: string;
      last_modified: string;
      size_bytes: number;
    }[];
}

/** API response for POST /predict_structure (message, task_id). */
export interface PredictionResponse {
    message: string;
    task_id: string;
}

/** API response for GET /task-status/{task_id}. */
export interface TaskStatusResponse {
    status: string;
    task_id: string;
}