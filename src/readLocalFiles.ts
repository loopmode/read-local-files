/**
 * Prompts the user to select one or more local files and returns a promise for the file contents. 
 * 
 * The file contents are wrapped in `FileReader` objects.
 * Use the `result` property of each resolved file reader to access the file contents as a string. 
 * 
 * The promise is kept alive until the user confirms the native file-open-dialog.
 * It is resolved when the user confirms or rejected when the user cancels.
 *
 * @param options.rejectTimeout Optional timeout in milliseconds for automatic rejection of the promise. Defaults to 500.
 * @param options.encoding Optional encoding for the FileReader API. Defaults to `UTF-8`.
 */
export function readLocalFile({
  encoding,
  rejectTimeout = 500
}: //
{
  encoding?: string;
  rejectTimeout?: number;
} = {}): Promise<(FileReader | null)[]> {
  //
  return new Promise((resolve, reject) => {
    const el = document.createElement("input");
    let isResolved: boolean;
    let rejectTimeoutID: number;
    const abort = (event: MouseEvent | FocusEvent) => {
      removeListeners();
      rejectTimeoutID = window.setTimeout(() => {
        if (event instanceof Error) {
          return reject(event);
        }
        if (isResolved) {
          return;
        }
        reject(new Error("ERR_ABORTED"));
      }, rejectTimeout);
    };
    const removeListeners = () => {
      window.clearTimeout(rejectTimeoutID);
      window.removeEventListener("mousemove", abort);
      window.removeEventListener("focus", abort);
    };
    el.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files) {
        return;
      }

      const readPromises = Array.from(target.files).map(file =>
        readOneFile(file, encoding)
      );

      Promise.all(readPromises)
        .then(events => {
          const fileContents = [...events].map(e => e.target);
          isResolved = true;
          removeListeners();
          resolve(fileContents);
        })
        .catch(error => {
          console.warn({ error });
          abort(error);
        });
    };

    el.setAttribute("type", "file");
    el.setAttribute("multiple", "multiple");
    el.click();

    window.addEventListener("mousemove", abort);
    window.addEventListener("focus", abort);
  });
}

export function readOneFile(
  file: Blob,
  encoding?: string
): Promise<ProgressEvent<FileReader>> {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = event => {
      console.error(event);
      reject(event);
    };
    reader.onload = event => {
      resolve(event);
    };

    reader.readAsText(file, encoding);
  });
}

export default readLocalFile;
