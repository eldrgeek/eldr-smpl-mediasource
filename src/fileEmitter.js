function defer() {
  var deferred = {};
  var promise = new Promise(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  deferred.promise = promise;
  return deferred;
}
const testDataReady = (data, deferred) => {
  setTimeout(() => deferred.resolve(), 1000);
};
const testDataEnded = () => {};
export default function fileEmitter(
  file = "https://simpl.info/mse/test.webm",
  ondataready = testDataReady,
  ondataended = testDataEnded
) {
  console.log("file emitter");
  get(file, async function(fileContents) {
    var file = new Blob([fileContents], {
      type: "video/webm"
    });
    //A token to control communcaion
    let deferred = null;
    var chunkSize = 23890;
    //the current file reader instance
    let reader = null;
    //an array of readers and their results
    let readers = [];
    //tne locad handler is invoked when a reader does it job
    //it pushes reader and result in to reeaders arrahy
    const loadHandler = e => {
      setTimeout(() => {
        console.log("LOAD MUST HAVE HAPPENED");
        readers.push({ reader, result: e.target.result });
        ondataready(e, deferred);
      });
    };

    //code to generate the stuff
    let bytesRead = 0;
    while (bytesRead < file.size) {
      let reader = new FileReader();
      deferred = defer();
      reader.onload = loadHandler;
      console.log("read ", bytesRead, bytesRead + chunkSize);
      var chunk = file.slice(bytesRead, bytesRead + chunkSize);
      reader.readAsArrayBuffer(chunk);

      await deferred.promise;
      bytesRead += chunkSize;
    }
    ondataended();
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
export function test(ondataready = logready, ondataended = logend) {
  fileEmitter("https://simpl.info/mse/test.webm", ondataready, ondataended);
}
