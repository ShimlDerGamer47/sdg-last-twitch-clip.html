document.addEventListener("DOMContentLoaded", () => {
  try {
    const currentDomain = window.location.hostname || window.location.href;
    const params = new URLSearchParams(location.search);
    const client = new StreamerbotClient({
      host: params.get("host") || "127.0.0.1",
      port: parseInt(params.get("port") || 8080, 10),
      endpoint: params.get("endpoint") || "/",
      password: params.get("password") || "",
      autoReconnect: true,
      immediate: true,
    });

    const html = document.documentElement;
    const body = document.body;

    const fontFamilyVar = "--font-family-var";
    const robotoBold = getComputedStyle(html)
      .getPropertyValue(fontFamilyVar)
      .trim();

    const copy = "copy";
    const dragstart = "dragstart";
    const keydown = "keydown";
    const select = "select";

    const none = "none";
    const def = "default";

    (function bodyToken() {
      if (robotoBold) {
        Object.assign(body.style, {
          fontFamily: robotoBold,
          webkitUserSelect: none,
          userSelect: none,
          cursor: def,
        });
      }

      const eventArray = [copy, dragstart, keydown, select];

      eventArray.forEach((event) => {
        if (!event) return;
        body.addEventListener(event, (e) => e.preventDefault());
      });
    })();

    const $ = (id) =>
      document.getElementById(id) || document.querySelector("#" + id);

    const twitchEmbedClipDiv = $("twitchEmbedClipContainerId");
    const twitchEmbedClipIframe = $("twitchEmbedClipId");

    if (twitchEmbedClipDiv && twitchEmbedClipIframe) {
      twitchEmbedClipIframe.setAttribute("loading", "eager");
      twitchEmbedClipIframe.setAttribute("src", "");
    }

    (function elementToken() {
      const elementArray = [twitchEmbedClipDiv, twitchEmbedClipIframe];
      const eventArray = [copy, dragstart, keydown, select];

      elementArray.forEach((element) => {
        if (!element) return;

        eventArray.forEach((event) => {
          if (!event) return;
          element.addEventListener(event, (e) => e.preventDefault());
        });
      });

      elementArray.filter(Boolean).forEach((element) => {
        if (!element) return;

        if (robotoBold) {
          Object.assign(element.style, {
            fontFamily: robotoBold,
            borderRadius: "25px",
            webkitUserSelect: none,
            userSelect: none,
            cursor: def,
          });
        }
      });
    })();

    let clipId = null;
    let clipDuration = null;
    let isProcessing = false;

    client.on("Misc.GlobalVariableUpdated", ({ event, data }) => {
      if (isProcessing) return;

      const varName = data?.name;
      const varValue = data?.newValue;
      if (!varName || !twitchEmbedClipIframe) return;

      if (
        varName === "lastClipIdRequest_Global" &&
        typeof varValue === "string" &&
        varValue.length > 0
      ) {
        clipId = varValue;
      }

      if (varName === "lastClipDuration_Global") {
        if (typeof varValue === "number") {
          clipDuration = varValue;
        } else if (typeof varValue === "string" && varValue.length > 0) {
          clipDuration = parseInt(varValue, 10);
        }
      }

      if (clipId && clipDuration && !Number.isNaN(clipDuration)) {
        isProcessing = true;

        twitchEmbedClipIframe.src =
          `https://clips.twitch.tv/embed?clip=${encodeURIComponent(clipId)}` +
          `&parent=${currentDomain}&autoplay=true&muted=false`;

        setTimeout(() => {
          twitchEmbedClipIframe.setAttribute("src", "");
          clipId = null;
          clipDuration = null;
          isProcessing = false;
        }, clipDuration + 3000);
      }
    });
  } catch (error) {
    console.error("Haupt-Fehler:", error);
  }
});
