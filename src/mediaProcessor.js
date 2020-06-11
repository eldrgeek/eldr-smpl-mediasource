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
import fileEmitter from "./fileEmitter";
// fileEmitter()
// This code adapted from Eric Bidelman's demo at
// http://html5-demos.appspot.com/static/media-source.html
export default function main() {
  var video = document.querySelector("#video1");
  var video2 = document.querySelector("#video2");

  const mediaSource1 = getMediaSource();
  const mediaSource = getMediaSource();
  console.log(mediaSource, mediaSource1);
  // if (!window.MediaSource) {
  //   alert("The MediaSource API is not available on this platform");
  // }

  // var mediaSource = new MediaSource();

  video.src = window.URL.createObjectURL(mediaSource);
  video2.src = window.URL.createObjectURL(mediaSource1);

  getMediaContent(mediaSource, mediaSource1);
  let sourceBuffer, sourceBuffer1;
  let ondataended, ondataready;
  function getMediaContent(mediaSource, mediaSource1) {
    mediaSource1.addEventListener("sourceopen", function() {
      sourceBuffer1 = mediaSource1.addSourceBuffer(
        'video/webm; codecs="vorbis,vp8"'
      ); //
      console.log("Got source bugger");
      ondataready = async (e, deferred) => {
        // let array/ = new Uint8Array(e.target.result);
        try {
          sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
        } catch (e) {
          console.log("append error", e.message);
        }

        if (video2.paused) {
          video2.play(); // Start playing after 1st chunk is appended.
        }
        setTimeout(() => {
          console.log("resolved");
          if (deferred) deferred.resolve();
        }, 2000);
      };
      ondataended = data => {
        // sourceBuffer.addEventListener("updateend", function() {
        //   if (
        //     !sourceBuffer.updating &&
        //     mediaSource.readyState === "open"
        //   ) {
        //     mediaSource.endOfStream();
        //   }
        // });
      };
      // fileEmitter(null, ondataready, ondataended);
    });
    mediaSource.addEventListener(
      "sourceopen",
      function() {
        sourceBuffer = mediaSource.addSourceBuffer(
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
            reader.onload = e => appendToBuffer(e);
            function appendToBuffer(e) {
              sourceBuffer1.appendBuffer(new Uint8Array(e.target.result));
              ondataready(e);
              // sourceBuffer.appendBuffer(new Uint8Array(e.target.result));

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
                setTimeout(() => readChunk_(++i), 3000);
              }
            }

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
  }

  mediaSource.addEventListener(
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
