'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = readLocalFile;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function readLocalFile() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        encoding = _ref.encoding,
        _ref$rejectTimeout = _ref.rejectTimeout,
        rejectTimeout = _ref$rejectTimeout === undefined ? 500 : _ref$rejectTimeout;

    return new Promise(function (resolve, reject) {
        var el = document.createElement('input');
        var isResolved = void 0;
        var rejectTimeoutID = void 0;
        var abort = function abort(event) {
            removeListeners();
            rejectTimeoutID = window.setTimeout(function () {
                if (event instanceof Error) {
                    return reject(event);
                }
                if (isResolved) {
                    return;
                }
                reject(new Error('ERR_ABORTED'));
            }, rejectTimeout);
        };
        var removeListeners = function removeListeners() {
            window.clearTimeout(rejectTimeoutID);
            window.removeEventListener('mousemove', abort);
            window.removeEventListener('focus', abort);
        };
        el.onchange = function (event) {
            var readPromises = [].concat(_toConsumableArray(event.target.files)).map(function (file) {
                return readOneFile(file, encoding);
            });

            Promise.all(readPromises).then(function (events) {
                var fileContents = [].concat(_toConsumableArray(events)).map(function (event) {
                    return event.target;
                });
                isResolved = true;
                removeListeners();

                resolve(fileContents);
            }).catch(function (error) {
                console.warn({ error: error });
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