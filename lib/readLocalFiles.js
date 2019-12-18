"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Reads a local file and returns a promise for its contents.
 *
 * The file contents are wrapped in a `FileReader` object.
 * Use the `result` property of the resolved file reader to access the file contents as a string.
 *
 * @param options.rejectTimeout Optional timeout in milliseconds for automatic rejection of the promise. Defaults to 500.
 * @param options.encoding Optional encoding for the FileReader API. Defaults to `UTF-8`.
 */
function readLocalFile(_a) {
    var _b = _a === void 0 ? {} : _a, encoding = _b.encoding, _c = _b.rejectTimeout, rejectTimeout = _c === void 0 ? 500 : _c;
    //
    return new Promise(function (resolve, reject) {
        var el = document.createElement("input");
        var isResolved;
        var rejectTimeoutID;
        var abort = function (event) {
            removeListeners();
            rejectTimeoutID = window.setTimeout(function () {
                if (event instanceof Error) {
                    return reject(event);
                }
                if (isResolved) {
                    return;
                }
                reject(new Error("ERR_ABORTED"));
            }, rejectTimeout);
        };
        var removeListeners = function () {
            window.clearTimeout(rejectTimeoutID);
            window.removeEventListener("mousemove", abort);
            window.removeEventListener("focus", abort);
        };
        el.onchange = function (event) {
            var target = event.target;
            if (!target.files) {
                return;
            }
            var readPromises = Array.from(target.files).map(function (file) {
                return readOneFile(file, encoding);
            });
            Promise.all(readPromises)
                .then(function (events) {
                var fileContents = __spreadArrays(events).map(function (e) { return e.target; });
                isResolved = true;
                removeListeners();
                resolve(fileContents);
            })
                .catch(function (error) {
                console.warn({ error: error });
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
exports.readLocalFile = readLocalFile;
function readOneFile(file, encoding) {
    return new Promise(function (resolve, reject) {
        var reader = new window.FileReader();
        reader.onerror = function (event) {
            console.error(event);
            reject(event);
        };
        reader.onload = function (event) {
            resolve(event);
        };
        reader.readAsText(file, encoding);
    });
}
exports.readOneFile = readOneFile;
exports.default = readLocalFile;
