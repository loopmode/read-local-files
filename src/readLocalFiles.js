export default function readLocalFile({ encoding, rejectTimeout = 500 } = {}) {
    return new Promise((resolve, reject) => {
        const el = document.createElement('input');
        let isResolved;
        let rejectTimeoutID;
        const abort = event => {
            removeListeners();
            rejectTimeoutID = window.setTimeout(() => {
                if (event instanceof Error) {
                    return reject(event);
                }
                if (isResolved) {
                    return;
                }
                reject(new Error('ERR_ABORTED'));
            }, rejectTimeout);
        };
        const removeListeners = () => {
            window.clearTimeout(rejectTimeoutID);
            window.removeEventListener('mousemove', abort);
            window.removeEventListener('focus', abort);
        };
        el.onchange = event => {
            const readPromises = [...event.target.files].map(file => {
                return readOneFile(file, encoding);
            });

            Promise.all(readPromises)
                .then(events => {
                    const fileContents = [...events].map(event => event.target);
                    isResolved = true;
                    removeListeners();

                    resolve(fileContents);
                })
                .catch(error => {
                    console.warn({ error });
                    abort(error);
                });
        };

        el.setAttribute('type', 'file');
        el.setAttribute('multiple', 'multiple');
        el.click();

        window.addEventListener('mousemove', abort);
        window.addEventListener('focus', abort);
    });
}

function readOneFile(file, encoding) {
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
