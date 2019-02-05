var speechText, recognition;
$(document).ready(function () {
    $(window).unload(function () {
        responsiveVoice.cancel();
    });
    $("#rec").click(function (event) {
        switchRecognition();
    });
});

function sayHello() {
    speechText = "Hi, there..! I am Monica, your personal assistant.";
    botVoiceResponse();
}

function processText(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        speechText = document.getElementById('chat-input').value;
        $("#chatMsgs").append('<li><p align="right" class="fa fa-user-circle" style = "    display: block;"> : ' + speechText + '</p></li>');
        /*ReqHandler reqHandler = new ReqHandler();
        reqHandler.post({url: '/ui/query', data: {'queryString': speechText}}, function(response) {          
          if (response.result) {
            //swal("Success", "Your leave request submitted successfully", "success");
          }
         })*/;
        botVoiceResponse();
        $('#chat-input').val('');
        $("#chat-input").attr("placeholder", "");
    }
}

function startRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.onstart = function (event) {
        updateRec();
    };
    recognition.onresult = function (event) {
        var text = "";
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
        }
        speechText = text;
        $("#chatMsgs").append('<li><p align="right" class="fa fa-user-circle" style = "    display: block;"> : ' + speechText + '</p></li>');
        botVoiceResponse();
        stopRecognition();
    };
    recognition.onend = function () {
        stopRecognition();
    };
    recognition.lang = "en-US";
    recognition.start();
}

function stopRecognition() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    updateRec();
}

function switchRecognition() {
    if (recognition) {
        stopRecognition();
    }
    else {
        startRecognition();
    }
}

function updateRec() {
    if (recognition) {
        $("#chat-input").attr("placeholder", "Listening...");
    }
    else {
        $("#chat-input").attr("placeholder", "");
    }
    $("#rec").css("color", "#330066");
}

function botVoiceResponse() {
    responsiveVoice.setDefaultVoice("US English Female");
    if (speechText != '' && speechText != null) {
        responsiveVoice.speak(speechText, 'US English Female');
        $("#chatMsgs").append('<li><p align="left" class="fas fa-cogs">' + speechText + '</p></li>');
        speechText = '';
    }
}