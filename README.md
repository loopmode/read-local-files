# read-local-files

Launches the native "open file" dialog and allows the user to choose one or more file to read contents from.
The function returns a promise that is resolved when the user picks files and rejected when the user cancels.

Cancel detection happens using `focus` and `mousemove` event listeners on the window object.

The promise is resolved with an array of `HTMLInputElement` objects of `type="file"` inputs. Each has a `result` property that holds the content of the loaded file.

## Installation

```javascript
yarn add @loopmode/read-local-files
```

## Usage

In the example we expect to user to open json files.

Using `async/await`

```javascript
import readLocalFiles from '@loopmode/read-local-files';

async function handleLoadClick() {
    try {
        const fileInputs = await readLocalFiles();
        const data = fileInputs.map(input => JSON.parse(input.result))
        console.log({data})
        
    } catch (error) {
        console.warn(error);  
    }
}
```

Using `Promise`

```javascript
import readLocalFiles from '@loopmode/read-local-files';

async function handleLoadClick() {
    readLocalFiles()
        .then(fileInputs => {
            const data = fileInputs.map(input => JSON.parse(input.result))
            console.log({data})
        })
        .catch(error => {
            console.warn(error)
        });
}
```

## Options

You shouldn't really need these..

`encoding` - Used for `FileReader.readAsText`. Defaults to `UTF-8`.  

See https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsText#Parameters

`rejectTimeout` - Amount of milliseconds to wait before rejecting the promise. Defaults to 500.

The promise is rejected on `mousemove` or `focus`, but this may happen just as well when the user actually did choose a file, and the dialog gets closed by the browser. In order to not immediatly reject the promise, we wait for `rejectTimeout` millis. If the files have been handled by now, we do not reject the promise.