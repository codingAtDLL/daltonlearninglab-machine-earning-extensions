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

    ext.sendChat = function(input, callback) {
        input = encodeURIComponent (input);

        $.ajax({
            url: "chat.php",
            data: {"text": input}, //input automatically encoded
            dataType: "json"
        }).done(function( json ) {
            if (json.result == 100) {
                callback(wordFilter(json.response));
            }
            else {
                callback("...");
            }
        })
    };

    ext.lowercase = function(input) {
        return input.toLowerCase();
    }

    ext.substring = function(pInput, pIndex, pStopIndex) {
        return pInput.substring(pIndex, pStopIndex);
    }

    ext.substr = function(pInput, pIndex, pLength) {
        return pInput.substr(pIndex, pLength);
    }

    ext.contains = function(pInput1, pInput2) {
        return pInput1.includes(pInput2);
    }

    ext.badWordsFilter = function(text) {
        return wordFilter(text);
    }

    var filterWords = ["4r5e",
"50 yard cunt punt",
"5h1t",
"5hit",
"a_s_s",
"a2m",
"a55",
"adult",
"amateur",
"anal",
"anal impaler",
"anal leakage",
"anilingus",
"anus",
"ar5e",
"arrse",
"arse",
"arsehole",
"ass",
"ass fuck",
"asses",
"assfucker",
"ass-fucker",
"assfukka",
"asshole",
"asshole",
"assholes",
"assmucus",
"assmunch",
"asswhole",
"autoerotic",
"b!tch",
"b00bs",
"b17ch",
"b1tch",
"ballbag",
"ballsack",
"bang (one's) box",
"bangbros",
"bareback",
"bastard",
"beastial",
"beastiality",
"beef curtain",
"bellend",
"bestial",
"bestiality",
"bi+ch",
"biatch",
"bimbos",
"birdlock",
"bitch",
"bitch tit",
"bitcher",
"bitchers",
"bitches",
"bitchin",
"bitching",
"bloody",
"blow job",
"blow me",
"blow mud",
"blowjob",
"blowjobs",
"blue waffle",
"blumpkin",
"boiolas",
"bollock",
"bollok",
"boner",
"boob",
"boobs",
"booobs",
"boooobs",
"booooobs",
"booooooobs",
"breasts",
"buceta",
"bugger",
"bum",
"bunny fucker",
"bust a load",
"busty",
"butt",
"butt fuck",
"butthole",
"buttmuch",
"buttplug",
"c0ck",
"c0cksucker",
"carpet muncher",
"carpetmuncher",
"cawk",
"chink",
"choade",
"chota bags",
"cipa",
"cl1t",
"clit",
"clit licker",
"clitoris",
"clits",
"clitty litter",
"clusterfuck",
"cnut",
"cock",
"cock pocket",
"cock snot",
"cockface",
"cockhead",
"cockmunch",
"cockmuncher",
"cocks",
"cocksuck",
"cocksucked",
"cocksucker",
"cock-sucker",
"cocksucking",
"cocksucks",
"cocksuka",
"cocksukka",
"cok",
"cokmuncher",
"coksucka",
"coon",
"cop some wood",
"cornhole",
"corp whore",
"cox",
"cum",
"cum chugger",
"cum dumpster",
"cum freak",
"cum guzzler",
"cumdump",
"cummer",
"cumming",
"cums",
"cumshot",
"cunilingus",
"cunillingus",
"cunnilingus",
"cunt",
"cunt hair",
"cuntbag",
"cuntlick",
"cuntlicker",
"cuntlicking",
"cunts",
"cuntsicle",
"cunt-struck",
"cut rope",
"cyalis",
"cyberfuc",
"cyberfuck",
"cyberfucked",
"cyberfucker",
"cyberfuckers",
"cyberfucking",
"d1ck",
"damn",
"dick",
"dick hole",
"dick shy",
"dickhead",
"dildo",
"dildos",
"dink",
"dinks",
"dirsa",
"dirty Sanchez",
"dlck",
"dog-fucker",
"doggie style",
"doggiestyle",
"doggin",
"dogging",
"donkeyribber",
"doosh",
"duche",
"dyke",
"eat a dick",
"eat hair pie",
"ejaculate",
"ejaculated",
"ejaculates",
"ejaculating",
"ejaculatings",
"ejaculation",
"ejakulate",
"erotic",
"f u c k",
"f u c k e r",
"f_u_c_k",
"f4nny",
"facial",
"fag",
"fagging",
"faggitt",
"faggot",
"faggs",
"fagot",
"fagots",
"fags",
"fanny",
"fannyflaps",
"fannyfucker",
"fanyy",
"fatass",
"fcuk",
"fcuker",
"fcuking",
"feck",
"fecker",
"felching",
"fellate",
"fellatio",
"fingerfuck",
"fingerfucked",
"fingerfucker",
"fingerfuckers",
"fingerfucking",
"fingerfucks",
"fist fuck",
"fistfuck",
"fistfucked",
"fistfucker",
"fistfuckers",
"fistfucking",
"fistfuckings",
"fistfucks",
"flange",
"flog the log",
"fook",
"fooker",
"fuck hole",
"fuck puppet",
"fuck trophy",
"fuck yo mama",
"fuck",
"fucka",
"fuck-ass",
"fuck-bitch",
"fucked",
"fucker",
"fuckers",
"fuckhead",
"fuckheads",
"fuckin",
"fucking",
"fuckings",
"fuckingshitmotherfucker",
"fuckme",
"fuckmeat",
"fucks",
"fucktoy",
"fuckwhit",
"fuckwit",
"fudge packer",
"fudgepacker",
"fuk",
"fuker",
"fukker",
"fukkin",
"fuks",
"fukwhit",
"fukwit",
"fux",
"fux0r",
"gangbang",
"gangbang",
"gang-bang",
"gangbanged",
"gangbangs",
"gassy ass",
"gaylord",
"gaysex",
"goatse",
"god",
"god damn",
"god-dam",
"goddamn",
"goddamned",
"god-damned",
"ham flap",
"hardcoresex",
"hell",
"heshe",
"hoar",
"hoare",
"hoer",
"homo",
"homoerotic",
"hore",
"horniest",
"horny",
"hotsex",
"how to kill",
"how to murdep",
"jackoff",
"jack-off",
"jap",
"jerk",
"jerk-off",
"jism",
"jiz",
"jizm",
"jizz",
"kawk",
"kinky Jesus",
"knob",
"knob end",
"knobead",
"knobed",
"knobend",
"knobend",
"knobhead",
"knobjocky",
"knobjokey",
"kock",
"kondum",
"kondums",
"kum",
"kummer",
"kumming",
"kums",
"kunilingus",
"kwif",
"l3i+ch",
"l3itch",
"labia",
"LEN",
"lmao",
"lmfao",
"lmfao",
"lust",
"lusting",
"m0f0",
"m0fo",
"m45terbate",
"ma5terb8",
"ma5terbate",
"mafugly",
"masochist",
"masterb8",
"masterbat*",
"masterbat3",
"masterbate",
"master-bate",
"masterbation",
"masterbations",
"masturbate",
"mof0",
"mofo",
"mo-fo",
"mothafuck",
"mothafucka",
"mothafuckas",
"mothafuckaz",
"mothafucked",
"mothafucker",
"mothafuckers",
"mothafuckin",
"mothafucking",
"mothafuckings",
"mothafucks",
"mother fucker",
"mother fucker",
"motherfuck",
"motherfucked",
"motherfucker",
"motherfuckers",
"motherfuckin",
"motherfucking",
"motherfuckings",
"motherfuckka",
"motherfucks",
"muff",
"muff puff",
"mutha",
"muthafecker",
"muthafuckker",
"muther",
"mutherfucker",
"n1gga",
"n1gger",
"nazi",
"need the dick",
"nigg3r",
"nigg4h",
"nigga",
"niggah",
"niggas",
"niggaz",
"nigger",
"niggers",
"nob",
"nob jokey",
"nobhead",
"nobjocky",
"nobjokey",
"numbnuts",
"nut butter",
"nutsack",
"omg",
"orgasim",
"orgasims",
"orgasm",
"orgasms",
"p0rn",
"pawn",
"pecker",
"penis",
"penisfucker",
"phonesex",
"phuck",
"phuk",
"phuked",
"phuking",
"phukked",
"phukking",
"phuks",
"phuq",
"pigfucker",
"pimpis",
"piss",
"pissed",
"pisser",
"pissers",
"pisses",
"pissflaps",
"pissin",
"pissing",
"pissoff",
"poop",
"porn",
"porno",
"pornography",
"pornos",
"prick",
"pricks",
"pron",
"pube",
"pusse",
"pussi",
"pussies",
"pussy",
"pussy fart",
"pussy palace",
"pussys",
"queaf",
"queer",
"rape",
"rectum",
"retard",
"rimjaw",
"rimming",
"s hit",
"s.o.b.",
"s_h_i_t",
"sadism",
"sadist",
"sandbar",
"sausage queen",
"schlong",
"screwing",
"scroat",
"scrote",
"scrotum",
"semen",
"sex",
"sh!+",
"sh!t",
"sh1t",
"shag",
"shagger",
"shaggin",
"shagging",
"shemale",
"shi+",
"shit",
"shit fucker",
"shitdick",
"shite",
"shited",
"shitey",
"shitfuck",
"shitfull",
"shithead",
"shiting",
"shitings",
"shits",
"shitted",
"shitter",
"shitters",
"shitting",
"shittings",
"shitty",
"skank",
"slope",
"slut",
"slut bucket",
"sluts",
"smegma",
"smut",
"snatch",
"son-of-a-bitch",
"spac",
"spunk",
"t1tt1e5",
"t1tties",
"teets",
"teez",
"testical",
"testicle",
"tit",
"tit wank",
"titfuck",
"tits",
"titt",
"tittie5",
"tittiefucker",
"titties",
"tittyfuck",
"tittywank",
"titwank",
"tosser",
"turd",
"tw4t",
"twat",
"twathead",
"twatty",
"twunt",
"twunter",
"v14gra",
"v1gra",
"vagina",
"viagra",
"vulva",
"w00se",
"wang",
"wank",
"wanker",
"wanky",
"whoar",
"whore",
"willies",
"willy",
"wtf",
"xrated",
"xxx",
"仆街",
"仆",
"屌",
"𨶙",
"鳩",
"撚",
"賓周",
"戇",
"尻",
"小你",
"吊你",
"老味",
"含能",
"臭西",
"凸你",
"傻西",
"臭化西",
"𨳒",
"肏",
"操你",
"on 9",
"on9",
"on 99",
"on99",
"收皮",
"diu",
"sub 9",
"老母",
"契弟",
"挑那星",
"吊夠",
"柒",
"笨七",
"七頭",
"卜街",
"能樣",
"冚家",
"CLS",
"chi lan sin",
"冚",
"DLLM",
"干你",
"幹你",
"DLNM",
"qu si",
"DNLM",
"去死",
"on79",
"onlun79",
"dklm",
"臭hi",
"臭花",
"粉腸",
"頂你",
"閪",
"屄",
"門小",
"小門",
"九鳥",
"7頭皮",
"人卜",
"家剷",
"硬膠",
"媽的",
"操你",
"哇靠",
"雞掰",
"鸠",
"拈",
"宾周",
"戆",
"吊够",
"七头",
"能样",
"粉肠",
"顶你",
"粉肠",
"顶你",
"门小",
"小门",
"九鸟",
"7头皮",
"家铲",
"硬胶",
"妈的",
"鸡掰",
"Jer Jer",
"亻卜"];
        // "i" is to ignore case and "g" for global
    var rgx = new RegExp(filterWords.join("|"), "gi");

    window.wordFilter = wordFilter = function (str) {          
            return str.replace(rgx, "****");           
    }

    var descriptor = {
        blocks: [
            ['R', 'bot answers to chat: %s', 'sendChat', 'Hello'],
            ['r', 'filter bad words %s', 'badWordsFilter', 'text'],
            [' ', 'new Classification', 'newTextRecognition'],
            [' ', 'reset Classification', 'newTextRecognition'],
            [' ', 'add training entry %s with label %s', 'addTrainingRecord', 'text', 'label'],
            ['w', 'train', 'train'],
            ['R', 'classify: %s', 'classifyText', 'text'],
            ['R', 'classify: %s and return csv', 'classifyTextAsCSV', 'text'],
            ['w', 'speak %s', 'speak_text', 'Hello!'],
            ['w', 'wait and recognize speech', 'recognize_speech'],
            ['r', 'recognized speech', 'recognized_speech'],
            ['r', 'lowercase: %s', 'lowercase', 'text'],
            ['r', 'substring %s %d %d', 'substring', 'text', '0', '1'],
            ['r', 'substr %s %d %d', 'substr', 'text', '0', '1'],
            ['b', '%s contains %s ?', 'contains', 'longstring','string']
        ]
    };

    ScratchExtensions.register('Dalton-Text-Recognition', descriptor, ext);
    
    


})({});