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
    let isLiveModeActive = false;
    let silenceTimer = null;

    // These will be set by initSpeech
    let userInputEl;
    let liveModeBtnEl;
    let sendMessageFn;

    // This flag is used by main.js to trigger TTS
    window.shouldSpeakResponse = false;

    // This is used by main.js to check if live mode is active
    window.isSpeechLiveModeActive = () => isLiveModeActive;

    // This is called by main.js when TTS finishes, to continue the conversation loop
    window.startListeningAfterSpeech = () => {
        if (isLiveModeActive) {
            startListening();
        }
    };

    // 3. Configure the engine
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-GB';

    // 4. Handle results
    recognition.onresult = (event) => {
        if (!isListening) return;

        // Prevent AI self-detection
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            recognition.stop();
            return;
        }

        let interimTranscript = '';
        let currentFinal = '';

        // Rebuild the transcript from the beginning to avoid duplication
        for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                currentFinal += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        finalTranscript = currentFinal; // Overwrite global state
        
        if (userInputEl) {
            userInputEl.value = (finalTranscript ? finalTranscript + ' ' : '') + interimTranscript;

            // Update live captions if visible
            const captionContainer = document.getElementById('live-captions-container');
            const captionEl = document.getElementById('live-caption-text');
            if (captionContainer && captionContainer.classList.contains('visible') && captionEl) {
                captionEl.textContent = finalTranscript + interimTranscript;
                captionEl.className = 'user-caption';
            }
            userInputEl.dispatchEvent(new Event('input')); // For suggestion box etc.
        }

        // Auto-send after 2 seconds of silence
        if (silenceTimer) clearTimeout(silenceTimer);
        if (isLiveModeActive && (finalTranscript || interimTranscript)) {
            silenceTimer = setTimeout(() => {
                if (isListening) stopListening(true);
            }, 1000);
        }
    };

    // 5. Listening lifecycle functions
    function startListening() {
        if (isListening) return;
        
        // Stop any AI speech before listening
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        // Haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }

        finalTranscript = "";
        if (userInputEl) userInputEl.value = "";
        if (silenceTimer) clearTimeout(silenceTimer);
        
        recognition.start();
        isListening = true;
        
        if (liveModeBtnEl) {
            liveModeBtnEl.classList.add('active');
        }
    }

    function stopListening(shouldSendMessage = true) {
        if (!isListening) return;

        if (silenceTimer) clearTimeout(silenceTimer);
        recognition.stop();
        isListening = false;

        if (liveModeBtnEl) {
            liveModeBtnEl.classList.remove('active');
        }

        if (shouldSendMessage && userInputEl && userInputEl.value.trim() && sendMessageFn) {
            window.shouldSpeakResponse = true;
            sendMessageFn();
            finalTranscript = ""; // Clear transcript after sending
        } else {
            finalTranscript = "";
            if (userInputEl) userInputEl.value = "";
        }
    }
    
    recognition.onend = () => {
        if (!isLiveModeActive) {
            if (isListening) stopListening(true);
            return;
        }
        // In live mode, when user pauses, send the message.
        // The TTS `onend` event will restart listening.
        if (isListening) {
            stopListening(true);
        }
    };

    // --- Live Mode ---

    function startLiveMode() {
        if (isLiveModeActive) return;
        isLiveModeActive = true;

        if (window.innerWidth <= 768) {
            const overlay = document.getElementById('live-mode-overlay');
            if (overlay) overlay.style.display = 'flex';
        }
        startListening();
    }

    function stopLiveMode() {
        if (!isLiveModeActive) return;
        isLiveModeActive = false;

        const overlay = document.getElementById('live-mode-overlay');
        if (overlay) overlay.style.display = 'none';

        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        stopListening(false); // false = don't send a message
    }

    function createLiveOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'live-mode-overlay';
        overlay.style.display = 'none';

        overlay.innerHTML = `
            <style>
                #live-mode-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; z-index: 2147483647; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; }
                .live-header { position: absolute; top: 20px; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; box-sizing: border-box; }
                .live-btn { background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center; }
                .pulsing-ball { width: 150px; height: 150px; background: radial-gradient(circle, #5891fA, #2563eb); border-radius: 50%; transition: transform 0.3s ease; }
                .pulsing-ball.speaking { animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
                .live-captions { position: absolute; bottom: 10%; width: 90%; max-width: 600px; text-align: center; font-size: 1.5rem; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
                .live-captions.visible { opacity: 1; }
                .live-captions .user-caption { color: #aaa; }
                .live-captions .ai-caption { color: #fff; font-weight: 600; }
            </style>
            <div class="live-header">
                <button id="live-close-btn" class="live-btn">&times;</button>
                <button id="live-captions-btn" class="live-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
            </div>
            <div id="pulsing-ball" class="pulsing-ball"></div>
            <div id="live-captions-container" class="live-captions">
                <p id="live-caption-text"></p>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('live-close-btn').onclick = stopLiveMode;
        document.getElementById('live-captions-btn').onclick = () => {
            document.getElementById('live-captions-container').classList.toggle('visible');
        };
    }

    function createLiveModeButton(sendBtn) {
        const liveBtn = document.createElement("button");
        liveBtn.id = "liveModeBtn";
        liveBtn.className = "action-btn";
        liveBtn.title = "Start Live Mode";
        
        // Attempt to match send button size/style
        let width = "40px";
        let height = "40px";
        let borderRadius = "50%";
        
        if (sendBtn) {
            const style = window.getComputedStyle(sendBtn);
            if (style.width && style.width !== 'auto') width = style.width;
            if (style.height && style.height !== 'auto') height = style.height;
            if (style.borderRadius) borderRadius = style.borderRadius;
        }

        Object.assign(liveBtn.style, {
            marginRight: "8px",
            background: "#2563eb",
            border: "none",
            cursor: "pointer",
            color: "white",
            borderRadius: borderRadius,
            width: width,
            height: height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s",
            alignSelf: "center"
        });

        liveBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="4" x2="12" y2="20"></line><line x1="6" y1="9" x2="6" y2="15"></line><line x1="18" y1="9" x2="18" y2="15"></line></svg>';
        
        liveBtn.onclick = () => {
            if (isLiveModeActive) {
                stopLiveMode();
            } else {
                startLiveMode();
            }
        };

        // Add a style for the active state
        const style = document.createElement('style');
        style.textContent = `#liveModeBtn.active { background-color: #ff4444 !important; }`;
        document.head.appendChild(style);

        return liveBtn;
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

        createLiveOverlay();
        liveModeBtnEl = createLiveModeButton(sendBtn);
        inputArea.insertBefore(liveModeBtnEl, sendBtn);
    };

    // Monkey patch speech synthesis to pause recognition when AI speaks
    if (window.speechSynthesis) {
        const originalSpeak = window.speechSynthesis.speak;
        window.speechSynthesis.speak = function(utterance) {
            if (isListening) {
                stopListening(false);
                if (isLiveModeActive) {
                    const originalOnEnd = utterance.onend;
                    utterance.onend = (e) => {
                        if (originalOnEnd) originalOnEnd(e);
                        startListening();
                    };
                }
            }
            originalSpeak.call(window.speechSynthesis, utterance);
        };
    }
})();
