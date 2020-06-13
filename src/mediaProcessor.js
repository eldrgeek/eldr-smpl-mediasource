/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { getMediaSource } from "./MyMediaSource";
import getMediaRecorder from "./getMediaRecorder";
import fileEmitter from "./fileEmitter";
function defer() {
  var deferred = {};
  var promise = new Promise(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  deferred.promise = promise;
  return deferred;
}
// fileEmitter()
// This code adapted from Eric Bidelman's demo at
// http://html5-demos.appspot.com/static/media-source.html
export default function main() {
  var video1 = document.querySelector("#video1");
  var video2 = document.querySelector("#video2");
  var video3 = document.querySelector("#video3");

  const mediaSource1 = getMediaSource();
  const mediaSource2 = getMediaSource();
  const mediaSource3 = getMediaSource();

  // if (!window.MediaSource) {
  //   alert("The MediaSource API is not available on this platform");
  // }

  // var mediaSource = new MediaSource();

  //save the file buffers created by read1 for use in read2
  let fileBuffers = [];
  ///Build stream based on buffers from read1
  let streams = []; //save the streams
  const closeStream = (sourceBuffer, mediaSource) => {
    sourceBuffer.addEventListener("updateend", function() {
      if (!sourceBuffer.updating && mediaSource.readyState === "open") {
        mediaSource.endOfStream();
      }
    });
  };
  const fillBuffer = async (sourceBuffer2, mediaSource2) => {
    let deferred = null;
    sourceBuffer2.onupdateend = () => deferred.resolve();
    for (let i = 0; i < fileBuffers.length; i++) {
      deferred = new defer();
      sourceBuffer2.appendBuffer(new Uint8Array(fileBuffers[i]));
      await deferred.promise;
    }
    mediaSource2.endOfStream();
  };
  const read1 = () => {
    const stream1 = window.URL.createObjectURL(mediaSource1);
    video1.src = stream1; //if this line is commented out the stream does not open
    streams[1] = stream1;
    mediaSource1.addEventListener(
      "sourceopen",
      function() {
        const sourceBuffer = mediaSource1.addSourceBuffer(
          'video/webm; codecs="vorbis,vp8"'
        );
        var FILE = "https://simpl.info/mse/test.webm";
        var NUM_CHUNKS = 10;
        get(FILE, function(uInt8Array) {
          var file = new Blob([uInt8Array], {
            type: "video/webm"
          });
          var chunkSize = Math.ceil(file.size / NUM_CHUNKS);

          log("Number of chunks: " + NUM_CHUNKS);
          console.log(
            "Chunk size: " + chunkSize + ", total size: " + file.size
          );

          // Slice the video into NUM_CHUNKS and append each to the media element.

          function readChunk_(i) {
            // eslint-disable-line no-shadow
            var reader = new FileReader();
            // Reads aren't guaranteed to finish in the same order they're started in,
            // so we need to read + append the next chunk after the previous reader
            // is done (onload is fired).
            reader.onload = function appendToBuffer(e) {
              fileBuffers.push(e.target.result);
              sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
              // sourceBuffer.appendBuffer(new Uint8Array(e.target.result));

              if (i === NUM_CHUNKS - 1) {
                closeStream(sourceBuffer, mediaSource1);
              } else {
                if (video1.paused) {
                  video1.play(); // Start playing after 1st chunk is appended.
                }
                readChunk_(++i);
              }
            };

            var startByte = chunkSize * i;
            var chunk = file.slice(startByte, startByte + chunkSize);

            reader.readAsArrayBuffer(chunk);
          }
          readChunk_(0); // Start the recursive call by self calling.
        });
        // }
      },
      false
    );
  };
  const read2 = () => {
    // console.log("read2 called", fileBuffers.length);
    const videoX = document.createElement("video");
    let stream2 = (video2.src = window.URL.createObjectURL(mediaSource2));
    videoX.src = stream2;
    mediaSource2.addEventListener("sourceopen", async function() {
      let sourceBuffer2 = mediaSource2.addSourceBuffer(
        'video/webm; codecs="vorbis,vp8"'
      ); //
      // console.log("read2 source open", fileBuffers.length);

      fillBuffer(sourceBuffer2, mediaSource2);
    });
  };
  //build stream based on recorder from stream1
  const read3 = () => {
    video3.src = window.URL.createObjectURL(mediaSource3);
    const recorder = getMediaRecorder(video1.captureStream());
    mediaSource3.onsourceopen = async function() {
      console.log("Added source buffer", mediaSource3.sourceBuffers.length);
      let sourceBuffer3 = mediaSource3.addSourceBuffer(
        // 'video/webm; codecs="vorbis,vp8"'
        "video/webm;codecs=vp9,opus"
      ); //
      let count = 0;
      let deferred = null;
      //called when the filereader has laoded
      const onFileReaderLoaded = e => {
        sourceBuffer3.appendBuffer(new Uint8Array(e.target.result));
      };
      //Called when the next chnuk is added to the source buffer
      sourceBuffer3.onupdateend = () => {
        deferred.resolve();
      };
      // fillBuffer(sourceBuffer3, mediaSource3)
      recorder.start(200);
      recorder.onstop = async () => {
        mediaSource3.onsourceopen = () => {};
        await deferred.promise;
        console.log("recorder stop");
        mediaSource3.endOfStream();
      };
      recorder.ondataavailable = async e => {
        deferred = defer();
        try {
          // let buffer = await e.data.arrayBuffer();
          const reader = new FileReader();
          reader.onload = onFileReaderLoaded;
          reader.readAsArrayBuffer(e.data);
        } catch (e) {
          console.log("Counld not append", e.toString());
        }
        await deferred.promise;
        // if(block <= N_BLOCKS) recorder.resume()
      };
    };
  };

  read1();
  setTimeout(read2, 300);
  setTimeout(read3, 200);

  mediaSource1.addEventListener(
    "sourceended",
    function() {
      log("MediaSource readyState: " + this.readyState);
    },
    false
  );

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

  function log(message) {
    document.getElementById("data").innerHTML += message + "<br /><br />";
  }
}
