const testDataReady = (data, chunk) => {
  console.log("test data ready", chunk);
  return new Promise(resolve => setTimeout(resolve, 1000));
};
const testDataEnded = () => {};
export default function fileEmitter(
  file = "https://simpl.info/mse/test.webm",
  dataready = testDataReady,
  dataended = testDataEnded
) {
  console.log("file emitter");
  get(file, async function(fileContents) {
    var file = new Blob([fileContents], {
      type: "video/webm"
    });
    var chunkSize = 43000;
    let deferred = null;
    const loadHandler = e => {
      let result = e.target.result;
      console.log("loaded ", e.target, result.byteLength);
      //sourceBuffer.appendBuffer(new Uint8Array(e.target.result));

      dataready(new Uint8Array(result));
      deferred.resolve();
    };
    let bytesRead = 0;
    while (bytesRead < file.size) {
      let reader = new FileReader();
      reader.onload = loadHandler;
      deferred = defer();
      console.log("read ", bytesRead, bytesRead + chunkSize);
      var chunk = file.slice(bytesRead, bytesRead + chunkSize);
      reader.readAsArrayBuffer(chunk);
      await deferred.promise;
      bytesRead += chunkSize;
    }
    dataended();
  });
  function get(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.send();

    xhr.onload = function() {
      if (xhr.status !== 200) {
        alert("Unexpected status code " + xhr.status + " for " + url);
        return false;
      }
      callback(new Uint8Array(xhr.response));
    };
  }
}
const logready = data => {
  console.log("data ready", data);
};
const logend = () => {
  console.log("data eneded");
};
export function test(dataready = logready, dataended = logend) {
  fileEmitter("https://simpl.info/mse/test.webm", dataready, dataended);
}
