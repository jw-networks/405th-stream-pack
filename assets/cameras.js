/* Camera links from config.js, shared by the overlay (stage.html) and the Director dock.
   VDO.Ninja links get the VDO.Ninja options from config.cameraParams;
   other links (e.g. your switcher's output pages) are used exactly as written. */
(function () {
  const C = window.PACK_CONFIG || {};
  const isNinja = url => /(^|\/\/|\.)(vdo\.ninja|obs\.ninja|vdo\.socialstream\.ninja)/i.test(url);

  function addParams(url, params) {
    for (const tok of String(params || "").split("&").filter(Boolean)) {
      const name = tok.split("=")[0];
      if (!new RegExp("[?&]" + name + "(=|&|$)").test(url)) url += (url.includes("?") ? "&" : "?") + tok;
    }
    return url;
  }

  /* where: "overlay" (the on-air overlay) or "dock" (preview tiles in the Director dock) */
  window.cameraUrl = function (seat, where) {
    return window.cameraUrlFrom((C.cameras || {})[seat], where);
  };
  window.cameraUrlFrom = function (raw, where) {
    let url = String(raw || "").trim();
    if (!url) return "";
    if (isNinja(url)) {
      url = addParams(url, C.cameraParams);
      if (where === "dock") url = addParams(url, "&noaudio");   // never play audio from the dock tiles
    } else if (where === "dock" && C.dockCameraParams) {
      url = addParams(url, C.dockCameraParams);
    }
    return url;
  };
})();
