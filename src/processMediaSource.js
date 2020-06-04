import getMediaSource from "./getMediaSource";

export default function processMediaSource(fileURL, cbAddChunk) {
  if (!window.MediaSource) {
    alert("The MediaSource API is not available on this platform");
  }

  var mediaSource = new MediaSource();

  // document.querySelector("[data-num-chunks]").textContent = NUM_CHUNKS;

  video.src = window.URL.createObjectURL(mediaSource);

  mediaSource.addEventListener(
    "sourceopen",
    function() {
      var sourceBuffer = mediaSource.addSourceBuffer(
        'video/webm; codecs="vorbis,vp8"'
      );
      console.log(sourceBuffer);

      log("MediaSource readyState: " + this.readyState);

      get(FILE, function(uInt8Array) {
        var file = new Blob([uInt8Array], {
          type: "video/webm"
        });
        var chunkSize = Math.ceil(file.size / NUM_CHUNKS);

        log("Number of chunks: " + NUM_CHUNKS);
        log("Chunk size: " + chunkSize + ", total size: " + file.size);

        // Slice the video into NUM_CHUNKS and append each to the media element.
        var i = 0;

        (function readChunk_(i) {
          // eslint-disable-line no-shadow
          var reader = new FileReader();

          // Reads aren't guaranteed to finish in the same order they're started in,
          // so we need to read + append the next chunk after the previous reader
          // is done (onload is fired).
          reader.onload = function(e) {
            sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
            log("Appending chunk: " + i);
            if (i === NUM_CHUNKS - 1) {
              sourceBuffer.addEventListener("updateend", function() {
                if (
                  !sourceBuffer.updating &&
                  mediaSource.readyState === "open"
                ) {
                  mediaSource.endOfStream();
                }
              });
            } else {
              if (video.paused) {
                video.play(); // Start playing after 1st chunk is appended.
              }
              readChunk_(++i);
            }
          };

          var startByte = chunkSize * i;
          var chunk = file.slice(startByte, startByte + chunkSize);

          reader.readAsArrayBuffer(chunk);
        })(i); // Start the recursive call by self calling.
      });
    },
    false
  );
}