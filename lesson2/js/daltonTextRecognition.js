(function(ext) {



    window.newTextRecognition = function() {
        window.TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
            binaryClassifierType: limdu.classifiers.SvmJs.bind(0, {C: 1.0})
        });
        window.intentClassifier = new limdu.classifiers.EnhancedClassifier({
            classifierType: TextClassifier,
            normalizer: limdu.features.LowerCaseNormalizer,
            featureExtractor: limdu.features.NGramsOfWords(1),  // each word ("1-gram") is a feature  
            featureLookupTable: new limdu.features.FeatureLookupTable()
        });
        window.trainingBatch = [];
    }
    window.newTextRecognition();
    

    ext._shutdown = function() {
        
    };

    ext._getStatus = function() {
        if (window.webkitSpeechRecognition === undefined) {
            return {status: 1, msg: 'Your browser does not support speech recognition. Try using Google Chrome.'};
        }
        else if (window.SpeechSynthesisUtterance === undefined) {
            return {status: 1, msg: 'Your browser does not support text to speech. Try using Google Chrome.'};
        }
        return {status: 2, msg: 'Ready'};
    };

    /************\
    |   BLOCKS   |
    \************/

    window.recognized_speech = '';

    ext.newTextRecognition = function () {
         window.newTextRecognition();
    };

    ext.addTrainingRecord = function (pInput, pLabel) {
         window.trainingBatch.push({input:pInput, output:pLabel});
    };

    ext.train = function (callback) {
        if (window.trainingBatch.length == 0) {
        }
        else if (window.trainingBatch.length == 1) {
            window.trainingBatch.push({input:"", output:""});
            window.intentClassifier.trainBatch(window.trainingBatch);
            window.trainingBatch.pop();
        }
        else {
            window.intentClassifier.trainBatch(window.trainingBatch);
        }
        callback();
    };

    ext.classifyText = function (pInput, callback) {
         var result = window.intentClassifier.classify(pInput);
         if (result.length) {
            callback(result[0]);
         }
         else {
            callback("");
         }         
    };

    ext.classifyTextAsCSV = function (pInput, callback) {
         callback(window.intentClassifier.trainBatch(window.trainingBatch));
    };

    ext.speak_text = function (text, callback) {
        var u = new SpeechSynthesisUtterance(text.toString());
        u.onend = function(event) {
            if (typeof callback=="function") callback();
        };        
        speechSynthesis.speak(u);
    };

    ext.recognize_speech = function (callback) {
        window.recognized_speech = "";
        window.recognition = new webkitSpeechRecognition();
        window.recognition.onresult = function(event) {
            console.log("result");
            window.recognized_speech = "";
            if (event.results.length > 0) {
                window.recognized_speech = event.results[0][0].transcript;
                console.log("result length > 0 " + window.recognized_speech);
            }
            //window.recognition.stop();
            //callback();

        };
        window.recognition.onnomatch = function(event) {
            console.log("no match / on error");
            callback();
        };
        window.recognition.onaudioend = function(event) {
            console.log("onaudioend");
            setTimeout(callback, 200);
        };
        window.recognition.start();
    };

    ext.recognized_speech = function () {return recognized_speech;};

    var descriptor = {
        blocks: [
            [' ', 'new Classification', 'newTextRecognition'],
            [' ', 'reset Classification', 'newTextRecognition'],
            [' ', 'add training entry %s with label %s', 'addTrainingRecord', 'text', 'label'],
            ['w', 'train', 'train'],
            ['R', 'classify: %s', 'classifyText', 'text'],
            ['R', 'classify: %s and return csv', 'classifyTextAsCSV', 'text'],
            ['w', 'speak %s', 'speak_text', 'Hello!'],
            ['w', 'wait and recognize speech', 'recognize_speech'],
            ['r', 'recognized speech', 'recognized_speech']
        ]
    };

    ScratchExtensions.register('Dalton-Text-Recognition', descriptor, ext);
    
    


})({});