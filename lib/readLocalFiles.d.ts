/**
 * Reads a local file and returns a promise for its contents.
 *
 * The file contents are wrapped in a `FileReader` object.
 * Use the `result` property of the resolved file reader to access the file contents as a string.
 *
 * @param options.rejectTimeout Optional timeout in milliseconds for automatic rejection of the promise. Defaults to 500.
 * @param options.encoding Optional encoding for the FileReader API. Defaults to `UTF-8`.
 */
export declare function readLocalFile({ encoding, rejectTimeout }?: {
    encoding?: string;
    rejectTimeout?: number;
}): Promise<(FileReader | null)[]>;
export declare function readOneFile(file: Blob, encoding?: string): Promise<ProgressEvent<FileReader>>;
export default readLocalFile;
