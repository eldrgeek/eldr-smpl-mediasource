let mediaSource;

export function getMediaSource() {
  if (!window.MediaSource) {
    alert("The MediaSource API is not available on this platform");
  }

  mediaSource = new MediaSource();

  return mediaSource;
}
