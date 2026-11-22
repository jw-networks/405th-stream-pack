/* Custom CSS for Discord's StreamKit Voice Widget, restyled to the 405th look.
   setup.html puts this into the "Discord voice" browser source's Custom CSS box.
   (To change it by hand: OBS → that source's Properties → Custom CSS.) */
window.DISCORD_VOICE_CSS = `
body { background: transparent !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important;
       font-family: "Bahnschrift Condensed", "Bahnschrift", "Arial Narrow", "Roboto Condensed", sans-serif !important; font-stretch: condensed; }
[class*="Voice_voiceContainer"], [class*="Voice_voiceStates"] { padding: 0 !important; margin: 0 !important; }
[class*="Voice_voiceState__"] { display: flex !important; align-items: center !important; height: 66px !important; margin: 0 0 8px !important;
  padding: 7px 12px !important; background: rgba(21,21,21,.94) !important; border-left: 5px solid #17706d !important; box-sizing: border-box !important; }
[class*="Voice_voiceState__"]:has([class*="Voice_avatarSpeaking"]) { background: rgba(23,112,109,.96) !important; border-left-color: #5ccbe9 !important; }
[class*="Voice_avatar__"] { width: 50px !important; height: 50px !important; border-radius: 0 !important; border: 0 !important; margin-right: 14px !important;
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); filter: grayscale(.5) brightness(.85); }
[class*="Voice_avatarSpeaking"] { filter: none !important; }
[class*="Voice_user__"] { padding: 0 !important; }
[class*="Voice_name__"] { color: #fff !important; background: none !important; font-size: 24px !important; font-weight: 700 !important;
  text-transform: uppercase !important; letter-spacing: .04em !important; text-shadow: none !important; padding: 0 !important; }
`;
