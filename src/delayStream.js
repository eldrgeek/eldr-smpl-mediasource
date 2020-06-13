import getMediaRecorder from "./getMediaRecorder";
import defer from "./defer";
var video3;
video3 = document.createElement("video");
video3 = document.querySelector("#video3");
video3.autoplay = video3.playsinline = true;

export default function delayStream(stream, delay = 200, video = video3) {
  const mediaSource = new MediaSource();
  let delayStream = (video3.src = window.URL.createObjectURL(mediaSource));

  const recorder = getMediaRecorder(stream);
  delayStream = video3.src = window.URL.createObjectURL(mediaSource);
  mediaSource.onsourceopen = async function() {
    console.log("Added source buffer", mediaSource.sourceBuffers.length);
    let sourceBuffer3 = mediaSource.addSourceBuffer(
      // 'video/webm; codecs="vorbis,vp8"'
      "video/webm;codecs=vp9,opus"
    ); //
    // document.querySelector("#video3").src = delayStream
    let deferred = null;
    //called when the filereader has laoded
    //Called when the next chnuk is added to the source buffer
    recorder.onstop = async () => {
      mediaSource.onsourceopen = () => {};
      await deferred.promise;
      console.log("recorder stop");
      mediaSource.endOfStream();
    };
    // let block = 0;
    recorder.ondataavailable = async e => {
      // console.log("data", ++block);
      deferred = defer();
      let buffer = await e.data.arrayBuffer();
      sourceBuffer3.appendBuffer(new Uint8Array(buffer));
      await deferred.promise;
      // if(block <= N_BLOCKS) recorder.resume()
    };
    sourceBuffer3.onupdateend = () => {
      deferred.resolve();
    };
    // fillBuffer(sourceBuffer3, mediaSource)
    if (stream.getTracks().length !== 0) {
      recorder.start(delay);
    } else {
      stream.onaddtrack = () => {
        recorder.start(delay);
        stream.onaddtrack = () => {};
      };
    }
  };
  return video.captureStream();
}
