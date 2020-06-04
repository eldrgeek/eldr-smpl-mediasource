export default function getMediaRecorder(stream) {
  // var mediaSource = new MediaSource();
  // mediaSource.addEventListener("sourceopen", handleSourceOpen, false);
  // function handleSourceOpen(event) {
  //   console.log("MediaSource opened");
  //   let sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  //   console.log("Source buffer: ", sourceBuffer);
  // }

  // console.log(location.host);
  // // window.isSecureContext could be used for Chrome
  // var isSecureOrigin =
  //   location.protocol === "https:" || location.host.includes("localhost");
  // if (!isSecureOrigin) {
  //   alert(
  //     "getUserMedia() must be run from a secure origin: HTTPS or localhost." +
  //       "\n\nChanging protocol to HTTPS"
  //   );
  //   location.protocol = "HTTPS";
  // }
  console.log("trying to get a stream");
  var options = { mimeType: "video/webm;codecs=vp9", bitsPerSecond: 100000 };
  let mediaRecorder = null;
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e0) {
    console.log(
      "Unable to create MediaRecorder with options Object: ",
      options,
      e0
    );
    try {
      options = { mimeType: "video/webm;codecs=vp8", bitsPerSecond: 100000 };
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e1) {
      console.log(
        "Unable to create MediaRecorder with options Object: ",
        options,
        e1
      );
      try {
        options = "video/mp4";
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e2) {
        alert("MediaRecorder is not supported by this browser.");
        console.error("Exception while creating MediaRecorder:", e2);
        return;
      }
    }
  }
  console.log("Created MediaRecorder", mediaRecorder, "with options", options);
  return mediaRecorder;
}
