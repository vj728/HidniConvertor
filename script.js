$(document).ready(function() {
    // Theme Toggle
    const themeToggle = $("#theme-toggle");
    const body = $("body");

    if (localStorage.getItem("theme") === "dark-mode") {
        body.addClass("dark-mode");
        themeToggle.text("☀️ Light Mode");
    }

    themeToggle.click(function() {
        body.toggleClass("dark-mode");
        if (body.hasClass("dark-mode")) {
            localStorage.setItem("theme", "dark-mode");
            themeToggle.text("☀️ Light Mode");
        } else {
            localStorage.setItem("theme", "light-mode");
            themeToggle.text("🌙 Dark Mode");
        }
    });

    // Hindi Conversion
    const englishInput = $("#english-input");
    const suggestionsBox = $("#suggestions");
    const hindiOutput = $("#hindi-output");

    englishInput.on("keydown", function(e) {
        // Hide suggestions when space is pressed
        if (e.key === " ") {
            suggestionsBox.hide();
        }
    });

    englishInput.on("input", function() {
        const text = englishInput.val();
        const lastChar = text.slice(-1);
        
        // Don't show suggestions if last character is space
        if (lastChar === " ") {
            suggestionsBox.hide();
            return;
        }
        
        const words = text.split(" ");
        const lastWord = words[words.length - 1];
        
        if (lastWord.trim() !== "") {
            fetchHindiSuggestions(lastWord);
        } else {
            suggestionsBox.hide();
        }
        
        updateHindiOutput(words);
    });

    function fetchHindiSuggestions(word) {
        const apiUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=hi-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data[0] === "SUCCESS") {
                    displaySuggestions(data[1][0][1]);
                }
            })
            .catch(console.error);
    }

    function displaySuggestions(suggestions) {
        suggestionsBox.empty();
        
        if (suggestions && suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                suggestionsBox.append(`<div class="suggestion">${suggestion}</div>`);
            });
            suggestionsBox.show();
        } else {
            suggestionsBox.hide();
        }
    }

    // Click suggestion
    suggestionsBox.on("click", ".suggestion", function() {
        const selected = $(this).text();
        const text = englishInput.val();
        const words = text.split(" ");
        words.pop();
        englishInput.val(words.join(" ") + " " + selected);
        suggestionsBox.hide();
        updateHindiOutput(words.concat(selected));
    });

    // Hide dropdown when clicking outside
    $(document).on("click", function(e) {
        if (!$(e.target).closest("#english-input, #suggestions").length) {
            suggestionsBox.hide();
        }
    });

    // Update Hindi Output
    function updateHindiOutput(words) {
        if (words.length === 0) return;

        const apiUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(words.join(" "))}&itc=hi-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data[0] === "SUCCESS") {
                    hindiOutput.text(data[1][0][1][0]);
                }
            })
            .catch(console.error);
    }

    // Buttons
    $("#copy-btn").click(() => {
        navigator.clipboard.writeText(hindiOutput.text());
        alert("Copied to clipboard!");
    });

    $("#clear-btn").click(() => {
        englishInput.val("");
        hindiOutput.text("");
        suggestionsBox.hide();
    });

    $("#download-btn").click(() => {
        const blob = new Blob([hindiOutput.text()], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "hindi-text.txt";
        a.click();
    });

    $("#speak-btn").click(() => {
        const hindiText = hindiOutput.text().trim();
        if (!hindiText) {
            alert("No Hindi text to speak!");
            return;
        }
    
        // Check if TTS is supported
        if (!('speechSynthesis' in window)) {
            alert("Text-to-Speech not supported in your browser. Try Chrome or Firefox.");
            return;
        }
    
        // Stop any ongoing speech
        window.speechSynthesis.cancel();
    
        const speech = new SpeechSynthesisUtterance(hindiText);
        speech.lang = "hi-IN";  // Hindi (India)
        speech.rate = 0.9;      // Slower speed for clarity
    
        // Force voice selection (if available)
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(voice => voice.lang === "hi-IN");
    
        if (hindiVoice) {
            speech.voice = hindiVoice;
        } else {
            console.warn("Hindi voice not found. Using default.");
        }
    
        // Speak with error handling
        try {
            window.speechSynthesis.speak(speech);
        } catch (error) {
            alert("Failed to speak. Error: " + error.message);
        }
    });


});