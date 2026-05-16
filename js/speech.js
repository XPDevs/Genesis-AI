(function() {
    'use strict';
    window.shouldSpeakResponse = false;
    window.isSpeechLiveModeActive = () => false;
    window.startListeningAfterSpeech = () => {};
    window.initSpeech = function() {
        window.dispatchEvent(new Event('speech-ready'));
    };
    window.dispatchEvent(new Event('speech-ready'));
})();
