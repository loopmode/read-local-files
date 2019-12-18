export const ERR_ABORTED = new Error('ERR_ABORTED');

/**
 * Prompts the user to select one or more local files and returns a promise for the file contents.
 * The promise is kept alive until the user confirms or cancels the native dialog for selecting files.
 *
 * When the user confirms, the promise is resolved with an array of [`FileReader`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) objects.
 * When the user aborts, the promise is rejected with an `ERR_ABORTED` error.
 *
 * @param options.multiple Whether to allow multiple file selection
 * @param options.rejectTimeout Timeout in milliseconds for rejecting of the promise after dialog is closed. This is a buffer time to avoid false detections. Defaults to 500. 
 * @param options.encoding Optional encoding for the FileReader API. Defaults to `UTF-8`.
 * @return {FileReader[]} An array of `RileReader` objects.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 */
export function readLocalFile({
  multiple,
  encoding,
  rejectTimeout = 500
}: //
{
  multiple?: boolean;
  encoding?: string;
  rejectTimeout?: number;
} = {}): Promise<(FileReader | null)[]> {
  //
  return new Promise((resolve, reject) => {
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
        reject(ERR_ABORTED);
      }, rejectTimeout);
    };

    const removeListeners = () => {
      window.clearTimeout(rejectTimeoutID);
      window.removeEventListener('mousemove', abort);
      window.removeEventListener('focus', abort);
    };

    const el = document.createElement('input');
    if (multiple) {
      el.setAttribute('multiple', 'multiple');
    }
    el.setAttribute('type', 'file');
    el.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files) {
        return;
      }
      const readerPromises = Array.from(target.files).map(file =>
        readOneFile(file, encoding)
      );

      Promise.all(readerPromises)
        .then(events => {
          const fileContents = [...events].map(e => e.target);
          isResolved = true;
          removeListeners();
          resolve(fileContents);
        })
        .catch(error => {
          abort(error);
        });
    };

    el.click();

    window.addEventListener('mousemove', abort);
    window.addEventListener('focus', abort);
  });
}

export function readOneFile(
  file: Blob,
  encoding?: string
): Promise<ProgressEvent<FileReader>> {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onerror = event => {
      reject(event);
    };
    reader.onload = event => {
      resolve(event);
    };
    reader.readAsText(file, encoding);
  });
}

export default readLocalFile;
