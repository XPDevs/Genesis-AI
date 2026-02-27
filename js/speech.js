(function() {
    'use strict';

    // 1. Check for browser support
    const SpeechEngine = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechEngine) {
        console.warn("Speech recognition is not supported in this browser.");
        // Define a dummy init function if not supported
        window.initSpeech = () => {};
        return;
    }

    // 2. Setup state and recognition engine
    const recognition = new SpeechEngine();
    let isListening = false;
    let finalTranscript = "";

    // These will be set by initSpeech
    let userInputEl;
    let micBtnEl;
    let sendMessageFn;

    // This flag is used by main.js to trigger TTS
    window.shouldSpeakResponse = false;

    // 3. Configure the engine
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    // 4. Handle results
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let newFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                newFinal += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (newFinal) {
            finalTranscript += newFinal;
        }
        
        if (userInputEl) {
            userInputEl.value = finalTranscript + interimTranscript;
            userInputEl.dispatchEvent(new Event('input')); // For suggestion box etc.
        }
    };

    // 5. Listening lifecycle functions
    function startListening() {
        if (isListening) return;
        
        // Stop any AI speech before listening
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        finalTranscript = "";
        if (userInputEl) userInputEl.value = "";
        
        recognition.start();
        isListening = true;
        
        if (micBtnEl) {
            micBtnEl.style.color = "#ff4444";
            micBtnEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="16" rx="2"></rect><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line></svg>';
        }
    }

    function stopListening() {
        if (!isListening) return;

        recognition.stop();
        isListening = false;

        if (micBtnEl) {
            micBtnEl.style.color = "var(--text-color)";
            micBtnEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
        }

        if (userInputEl && userInputEl.value.trim() && sendMessageFn) {
            window.shouldSpeakResponse = true;
            sendMessageFn();
            finalTranscript = ""; // Clear transcript after sending
        }
    }
    
    recognition.onend = () => { if (isListening) stopListening(); };

    // 6. Create the UI button
    function createMicButton() {
        const micBtn = document.createElement("button");
        micBtn.id = "micBtn";
        micBtn.className = "action-btn";
        micBtn.title = "Speak to AI";
        micBtn.style.marginRight = "8px";
        micBtn.style.background = "transparent";
        micBtn.style.border = "none";
        micBtn.style.cursor = "pointer";
        micBtn.style.color = "var(--text-color)";
        micBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>';
        micBtn.onclick = () => { isListening ? stopListening() : startListening(); };
        return micBtn;
    }

    // 7. Expose the initialization function
    window.initSpeech = function(options) {
        const { inputArea, userInput, sendBtn, sendMessage } = options;
        if (!inputArea || !userInput || !sendBtn || !sendMessage) {
            console.error("Speech initialization failed: Missing required elements or functions.");
            return;
        }
        userInputEl = userInput;
        sendMessageFn = sendMessage;
        micBtnEl = createMicButton();
        inputArea.insertBefore(micBtnEl, sendBtn);
    };
})();
