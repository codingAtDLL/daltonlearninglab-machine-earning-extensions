(function(ext) {

window.num_classes = 10;
window.classes_labels = [];
window.classes_sampled = [];
for (var i=0;i<num_classes;i++) classes_sampled.push(0);
window.current_label = 0;
window.num_batches = 1;
window.img_data = new Array(window.num_batches);
window.labelled_img_data_list = [];
window.loaded = new Array(num_batches);
window.loaded_train_batches = [];
window.use_validation_data = true;
window.maxmin;
window.f2t;

window.showResult=false;

window.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

    window.newImageRecognition = function(pNumClass) {
        window.net = new convnetjs.Net();

        window.num_classes = pNumClass;
        window.classes_sampled = [];
        window.classes_labels = [];
        window.labelled_img_data_list = [];
        for (var i=0;i<num_classes;i++) {
            classes_sampled.push(0);
            labelled_img_data_list.push([]);
        }

        window.layer_defs = [];
        layer_defs.push({type:'input', out_sx:32, out_sy:32, out_depth:3});
        layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
        layer_defs.push({type:'pool', sx:2, stride:2});
        layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
        layer_defs.push({type:'pool', sx:2, stride:2});
        layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
        layer_defs.push({type:'pool', sx:2, stride:2});
        layer_defs.push({type:'softmax', num_classes:pNumClass});

        net.makeLayers(layer_defs);

        window.trainer = new convnetjs.SGDTrainer(net, {method:'adadelta', batch_size:4, l2_decay:0.0001});
    }
    window.newImageRecognition(window.num_classes);

    window.step = function(sample) {
      var x = sample.x;
      var y = sample.label;

      if(sample.isval) {
        // use x to build our estimate of validation error
        net.forward(x);
        var yhat = net.getPrediction();
        var val_acc = yhat === y ? 1.0 : 0.0;
        //valAccWindow.add(val_acc);
        return; // get out
      }

      // train on it with network
      var stats = trainer.train(x, y);
      var lossx = stats.cost_loss;
      var lossw = stats.l2_decay_loss;

      // keep track of stats such as the average training error and loss
      var yhat = net.getPrediction();
      var train_acc = yhat === y ? 1.0 : 0.0;
      
      
    }

    window.tImgData;

    window.get_training_sample_piece = function(pLabel, pImgData) {
      tImgData = pImgData;
      // find an unloaded batch
      var k = Math.floor(Math.random()*1000); // sample within the batch

      // fetch the appropriate row of the training image and reshape into a Vol
      var x = new convnetjs.Vol(32,32,3,0.0);
      var W = 32*32;
      var j=0;
      for(var dc=0;dc<3;dc++) {
        var i=0;
        for(var xc=0;xc<32;xc++) {
          for(var yc=0;yc<32;yc++) {
            var ix = (i) * 4 + dc;
            x.set(yc,xc,dc,pImgData[ix]/255.0-0.5);
            i++;
          }
        }
      }
      var dx = Math.floor(Math.random()*5-2);
      var dy = Math.floor(Math.random()*5-2);
      x = convnetjs.augment(x, 32, dx, dy, Math.random()<0.5); //maybe flip horizontally

      return {x:x, label:pLabel, isval:0};
    }

    window.preds = [];
    

    window.startImageWebcam = function() {
        if (navigator.getUserMedia) {
           navigator.getUserMedia (

              // constraints
              {
                 video: true,
                 audio: false
              },

              // successCallback
              function(localMediaStream) {
                  video = document.createElement('video');
                 video.src = window.URL.createObjectURL(localMediaStream);
                 window.webcamStream = localMediaStream;
              },

              // errorCallback
              function(err) {
                 console.log("The following error occured: " + err);
              }
           );
        } else {
           console.log("getUserMedia not supported");
        }  
      }

      function stopWebcam() {
          window.webcamStream.getVideoTracks().forEach(function(track) {
            track.stop();
          });
      }
      //---------------------
      // TAKE A SNAPSHOT CODE
      //---------------------

    window.canvas = document.createElement('canvas');
    window.canvas.width = 32;
    window.canvas.height = 32;

    window.ctx = canvas.getContext('2d');


     window.snapshot = function() {
         // Draws current image from the video element into the canvas
        ctx.drawImage(video, 0,0, canvas.width, canvas.height);
        img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return img_data;
      }

    window.train = function(pImgData) {
        step(get_training_sample_piece(current_label, pImgData.data));
      }

      window.snapshotAndStoreSample = function() {
        labelled_img_data_list[current_label].push(snapshot());
        classes_sampled[current_label]++;
        console.log(current_label+": "+classes_sampled[current_label]);
      }


    window.predict = function(pImgData) {


        var sample = get_training_sample_piece('', pImgData.data);

        // forward prop it through the network
        var aavg = new convnetjs.Vol(1,1,net.layers[net.layers.length-1].out_depth,0.0);
        // ensures we always have a list, regardless if above returns single item or list
        var xs = [].concat(sample.x);
        var n = xs.length;
        for(var i=0;i<n;i++) {
          var a = net.forward(xs[i]);
          aavg.addFrom(a);
        }
        preds = [];
        for(var k=0;k<aavg.w.length;k++) { preds.push({k:k,p:aavg.w[k]}); }
        preds.sort(function(a,b){return a.p<b.p ? 1:-1;});
        
        return preds; 
      }

      




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

    ext.newImageRecognition = function (pNumClass) {
         window.newImageRecognition(parseInt(pNumClass,10));
    };

    window.samplingInterval = 50;
    window.samplingIntervalID = 0;

    ext.startSampling = function (pLabel) {
        clearInterval(samplingIntervalID);
        startImageWebcam();
        if (classes_labels.indexOf(pLabel) == -1) {
            classes_labels.push(pLabel);
        }
        current_label = classes_labels.indexOf(pLabel);
        samplingIntervalID = setInterval(window.snapshotAndStoreSample, samplingInterval);
    };

    ext.stopSampling = function () {
        stopWebcam();
        clearInterval(samplingIntervalID);
    };

    ext.classifyCameraImage = function(callback) {
        startImageWebcam();
        callback(classes_labels[predict(snapshot())[0].k]);
        stopWebcam();
    };

    ext.trainImageSamples = function(pTrainTimes, callback) {
        for (var i=0;i<pTrainTimes;i++) {
            var sample_class_id = getRandomInt(0,num_classes-1);
            var sample_img_data = labelled_img_data_list[sample_class_id][getRandomInt(0,labelled_img_data_list[sample_class_id].length-1)];
            step(get_training_sample_piece(sample_class_id, sample_img_data.data));
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
            [' ', 'new Image Recognition with %s classes', 'newImageRecognition', 10],
            [' ', 'reset Image Recognition with %s classes', 'newImageRecognition', 10],
            [' ', 'start sampling from camera with label %s', 'startSampling', 'label'],
            [' ', 'stop sampling from camera', 'stopSampling'],
            ['w', 'train samples %s', 'trainImageSamples', 100],
            ['R', 'classify camera image', 'classifyCameraImage'],
            ['w', 'speak %s', 'speak_text', 'Hello!'],
            ['w', 'wait and recognize speech', 'recognize_speech'],
            ['r', 'recognized speech', 'recognized_speech']
        ]
    };

    ScratchExtensions.register('Dalton-Image-Recognition', descriptor, ext);
    
    


})({});