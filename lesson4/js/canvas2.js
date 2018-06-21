
(function(ext) {
    // Canvas used for offscreen drawing
    var canvas = document.createElement('canvas');
    canvas.id = 'offscreenCanvas';
    canvas.width = 480;
    canvas.height = 360;
    var ctx = canvas.getContext('2d');

    // Visible canvas covering the stage
    var stage = document.createElement('canvas');
    stage.id = 'stageCanvas';
    stage.width = 480;
    stage.height = 360;
    $(stage).css({
        left: '6px',
        pointerEvents: 'none',
        position: 'absolute',
        top: '72px'
    });
    document.body.appendChild(stage);
    var stageCtx = stage.getContext('2d');

    var gradients = {};
    var images = {};
    var patterns = {};

    ext._shutdown = function() {
        document.body.removeChild(stage);
    };

    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };

    /************\
    |   BLOCKS   |
    \************/

    ext.arc = function(x, y, r, angleA, angleB, direction) {
        ctx.arc(x, y, r, angleA*(Math.PI/180), angleB*(Math.PI/180), direction == 'anticlockwise');
    };

    ext.beginPath = function() {
        ctx.beginPath();
    };

    ext.bezierCurveCubic = function(cp1x, cp1y, cp2x, cp2y, x, y) {
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    };

    ext.bezierCurveQuadratic = function(cpx, cpy, x, y) {
        ctx.quadraticCurveTo(cpx, cpy, x, y);
    };

    ext.clear = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    ext.clearRect = function(x, y, w, h) {
        ctx.clearRect(x, y, w, h);
    };

    ext.clip = function() {
        ctx.clip();
    };

    ext.closePath = function() {
        ctx.closePath();
    };

    ext.colour = function(colour) {
        var hex;
        if (colour < 0) {
            hex = (0x1000000 + colour).toString(16);
        } else {
            hex = colour.toString(16);
        }
        while (hex.length < 6) {
            hex = '0' + hex;
        }
        return '#' + hex;
    };

    ext.createImageFromRect = function(name, x, y, w, h) {
        images[name] = ctx.getImageData(x, y, w, h);
    };

    ext.loadImageFromUserFile = function(name, x, y, callback) {
        ext.createImageFromUserFile(name, callback);
        window.userImageX = x;
        window.userImageY = y;
    }

    ext.createImageFromUserFile = function(name, callback) {
        window.userImageName = name;
        JSshowImageDialog();
        window.userImageCallBack = callback;
    }

    window.processUserImage = function(pFiles) {
        var fr = new FileReader();
        fr.onload = function () {
            console.log("processUserImage on load " + window.userImageName);
            var img;
            name = window.userImageName;
            if (document.getElementById(name) == undefined) {
                img = document.createElement("img");
                img.style.visibility = 'hidden';
                img.id = name;
                img.width = 227;
                img.height = 227;
                document.getElementsByTagName('body')[0].appendChild(img);
                console.log("create image " + name + ", getElementById" + document.getElementById(name));
            }
            else {
                img = document.getElementById(name);
                console.log("exist element image " + name + ", getElementById" + document.getElementById(name));
            }            
            img.src = fr.result;
            img.crossOrigin = "";

            images[name] = new Image();
            images[name].crossOrigin="";
            images[name].addEventListener('load', function() {
                
            });
            images[name].src = fr.result;

            clear();
            ext.drawImage(window.userImageName,window.userImageX,window.userImageY);
            refresh();

            window.userImageCallBack();
        }
        fr.readAsDataURL(pFiles[0]);        
    }

    ext.createImageFromURL = function(name, url, callback) {
        window.createTopImageFromURL(name, url, function(){});

        images[name] = new Image();
        images[name].crossOrigin="anonymous";
        images[name].addEventListener('load', function() {
            callback();
        });
        images[name].src = url;
    };

    ext.predictImage = function(name, callback) {
        return window.aiPredictTopImage(name, callback);
    };

    ext.createLinearGradient = function(name, x1, y1, x2, y2) {
        gradients[name] = ctx.createLinearGradient(x1, y1, x2, y2);
    };

    ext.createPattern = function(name, image, repeat) {
        patterns[name] = ctx.createPattern(images[image], repeat);
    };

    ext.createRadialGradient = function(name, x1, y1, r1, x2, y2, r2) {
        gradients[name] = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
    };

    ext.drawImage = function(name, x, y) {
        if (images[name].toString() === '[object HTMLImageElement]') {
            var maxWidth = 300;
            var maxHeight = 200;
            var tWidth = images[name].naturalWidth;
            var tHeight = images[name].naturalHeight;
            if (tWidth > maxWidth) {
                tHeight = Math.floor(tHeight*maxWidth/tWidth);
                tWidth = maxWidth;
            }
            if (tHeight > maxHeight) {
                tWidth = Math.floor(tWidth*maxHeight/tHeight);
                tHeight = maxHeight;
            }
            ctx.drawImage(images[name], x, y); // image from URL
        } else {
            ctx.putImageData(images[name], x, y); // image from rect
        }
    };

    ext.fillRect = function(x, y, w, h) {
        ctx.fillRect(x, y, w, h);
    };

    ext.fill = function() {
        ctx.fill();
    };

    ext.fillStyleColour = function(colour) {
        ctx.fillStyle = colour;
    };

    ext.fillStyleGradient = function(name) {
        ctx.fillStyle = gradients[name];
    };

    ext.fillStylePattern = function(name) {
        ctx.fillStyle = patterns[name];
    };

    ext.fillText = function(text, x, y) {
        ctx.fillText(text, x, y);
    };

    ext.font = function(font) {
        ctx.font = font;
    };

    ext.gradientAddColourStop = function(name, colour, stop) {
        gradients[name].addColorStop(stop/100, colour);
    };

    ext.imageHeight = function(name) {
        return images[name].height;
    };

    ext.imageWidth = function(name) {
        return images[name].width;
    };

    ext.isPointInPath = function(x, y) {
        return ctx.isPointInPath(x, y);
    };

    ext.isPointInStroke = function(x, y) {
        return ctx.isPointInStroke(x, y);
    };

    ext.lineTo = function(x, y) {
        ctx.lineTo(x, y);
    };

    ext.lineCap = function(cap) {
        ctx.lineCap = cap;
    };

    ext.lineDash = function(dash) {
        ctx.setLineDash(dash.split(','));
    };

    ext.lineDashOffset = function(offset) {
        ctx.lineDashOffset = offset;
    };

    ext.lineJoin = function(join) {
        ctx.lineJoin = join;
    };

    ext.lineWidth = function(width) {
        ctx.lineWidth = width;
    };

    ext.miterLimit = function(limit) {
        ctx.miterLimit = limit;
    };

    ext.moveTo = function(x, y) {
        ctx.moveTo(x, y);
    };

    ext.refresh = function() {
        stageCtx.clearRect(0, 0, canvas.width, canvas.height);
        stageCtx.drawImage(canvas, 0, 0);
    };

    ext.resetTransform = function() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    ext.rotate = function(angle, unit, x, y) {
        ctx.translate(x, y);
        ctx.rotate(unit == 'radians' ? angle : angle*(Math.PI/180));
        ctx.translate(-x, -y);
    };

    ext.scale = function(x, y) {
        ctx.scale(x, y);
    };

    ext.setAlpha = function(alpha) {
        ctx.globalAlpha = alpha/100;
    };

    ext.setCompositeOperation = function(mode) {
        ctx.globalCompositeOperation = mode;
    };

    ext.shadowBlur = function(level) {
        ctx.shadowBlur = level;
    };

    ext.shadowColour = function(colour) {
        ctx.shadowColor = colour;
    };

    ext.shadowOffsetX = function(offset) {
        ctx.shadowOffsetX = offset;
    };

    ext.shadowOffsetY = function(offset) {
        ctx.shadowOffsetY = offset;
    };

    ext.stroke = function() {
        ctx.stroke();
    };

    ext.strokeRect = function(x, y, w, h) {
        ctx.strokeRect(x, y, w, h);
    };

    ext.strokeStyleColour = function(style) {
        ctx.strokeStyle = style;
    };

    ext.strokeStyleGradient = function(name) {
        ctx.strokeStyle = gradients[name];
    };

    ext.strokeStylePattern = function(name) {
        ctx.strokeStyle = patterns[name];
    };

    ext.strokeText = function(text, x, y) {
        ctx.strokeText(text, x, y);
    };

    ext.textAlign = function(alignment) {
        ctx.textAlign = alignment;
    };

    ext.textBaseline = function(baseline) {
        ctx.textBaseline = baseline;
    };

    ext.textWidth = function(text) {
        return ctx.measureText(text).width;
    };

    ext.translate = function(x, y) {
        ctx.translate(x, y);
    };

/*
            [' ', 'clear canvas', 'clear'],
            [' ', 'refresh canvas', 'refresh'],
            [' ', 'fill colour %s', 'fillStyleColour', 'red'],
            [' ', 'stroke colour %s', 'strokeStyleColour', 'blue'],
            [' ', 'fill gradient %s', 'fillStyleGradient', 'gradient1'],
            [' ', 'stroke gradient %s', 'strokeStyleGradient', 'gradient1'],
            [' ', 'fill pattern %s', 'fillStylePattern', 'pattern1'],
            [' ', 'stroke pattern %s', 'strokeStylePattern', 'pattern1'],
            [' ', 'create linear gradient %s x1: %n y1: %n x2: %n y2: %n', 'createLinearGradient', 'gradient1', 10, 10, 200, 100],
            [' ', 'create radial gradient %s x1: %n y1: %n r1: %n x2: %n y2: %n r2: %n', 'createRadialGradient', 'gradient1', 50, 50, 50, 50, 50, 0],
            [' ', 'gradient %s add colour %s at stop %n%', 'gradientAddColourStop', 'gradient1', 'green', 50],
            [' ', 'create pattern %s from image %s %m.patternRepeat', 'createPattern', 'pattern1', 'image1', 'repeat'],
            [' ', 'line width %n', 'lineWidth', 10],
            [' ', 'line cap %m.lineCap', 'lineCap', 'butt'],
            [' ', 'line join %m.lineJoin', 'lineJoin', 'miter'],
            [' ', 'miter limit %n', 'miterLimit', 10],
            [' ', 'line dash %s', 'lineDash', '5, 5, 15, 5'],
            [' ', 'line dash offset %n', 'lineDashOffset', 2],
            ['r', 'colour %c to hex', 'colour'],
            [' ', 'set alpha to %n%', 'setAlpha', '50'],
            [' ', 'set composite operation to %m.compositeOperation', 'setCompositeOperation', 'source-over'],
            [' ', 'translate x: %n y: %n', 'translate', 10, 10],
            [' ', 'rotate %n %m.angleUnit at centre x: %n y: %n', 'rotate', 45, 'degrees', 240, 180],
            [' ', 'scale x: %n y: %n', 'scale', 1, -1],
            [' ', 'reset transform', 'resetTransform'],
            [' ', 'clear rect x: %n y: %n w: %n h: %n', 'clearRect', 0, 0, 100, 100],
            [' ', 'fill rect x: %n y: %n w: %n h: %n', 'fillRect', 0, 0, 100, 100],
            [' ', 'stroke rect x: %n y: %n w: %n h: %n', 'strokeRect', 0, 0, 100, 100],
            [' ', 'begin path', 'beginPath'],
            [' ', 'close path', 'closePath'],
            [' ', 'clip', 'clip'],
            ['b', 'is point x: %n y: %n in path', 'isPointInPath'],
            ['b', 'is point x: %n y: %n in stroke', 'isPointInStroke'],
            [' ', 'move to x: %n y: %n', 'moveTo', 20, 20],
            [' ', 'line to x: %n y: %n', 'lineTo', 100, 100],
            [' ', 'quadratic bézier curve cpx: %n cpy: %n x: %n y: %n', 'bezierCurveQuadratic', 230, 30, 50, 100],
            [' ', 'cubic bézier curve cp1x: %n cp1y: %n cp2x: %n cp2y: %n x: %n y: %n', 'bezierCurveCubic', 100, 100, 150, 50, 10, 10],
            [' ', 'arc x: %n y: %n radius: %n start angle: %n end angle: %n direction: %m.arcDirection', 'arc', 0, 0, 50, 0, 360, 'clockwise'],
            [' ', 'fill', 'fill'],
            [' ', 'stroke', 'stroke'],
            [' ', 'shadow blur %n', 'shadowBlur', 10],
            [' ', 'shadow colour %s', 'shadowColour', 'black'],
            [' ', 'shadow offset x %n', 'shadowOffsetX', 10],
            [' ', 'shadow offset y %n', 'shadowOffsetY', 10],
            [' ', 'font %s', 'font', '48px serif'],
            [' ', 'text align %m.textAlignment', 'textAlign', 'start'],
            [' ', 'text baseline %m.textBaseline', 'textBaseline', 'alphabetic'],
            [' ', 'fill text %s at x: %n y: %n', 'fillText', 'Hello, world!', 20, 20],
            [' ', 'stroke text %s at x: %n y: %n', 'strokeText', 'Hello, world!', 20, 20],
            ['r', 'width of text %s', 'textWidth', 'Hello, world!'],
            ['w', 'create image %s from user file', 'createImageFromUserFile', 'image1'],
            ['w', 'create image %s from url %s', 'createImageFromURL', 'image1', 'https://storage.googleapis.com/learnjs-data/images/cat.jpeg'],
            [' ', 'create image %s from rect x: %n y: %n w: %n h: %n', 'createImageFromRect', 'image1', 10, 10, 100, 100],
            ['r', 'image %s width', 'imageWidth', 'image1'],
            ['r', 'image %s height', 'imageHeight', 'image1'],
*/

    var descriptor = {
        blocks: [
            ['w', 'load image %s at x: %n y: %n', 'loadImageFromUserFile', 'image1', 0, 0],
            [' ', 'draw image %s at x: %n y: %n', 'drawImage', 'image1', 0, 0],
            ['R', 'predict image %s', 'predictImage', 'image1']
        ],
        menus: {
            angleUnit: ['degrees', 'radians'],
            arcDirection: ['clockwise', 'anticlockwise'],
            compositeOperation: ['source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'],
            lineCap: ['butt', 'round', 'square'],
            lineJoin: ['miter', 'bevel', 'round'],
            patternRepeat: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'],
            textAlignment: ['start', 'end', 'left', 'center', 'right'],
            textBaseline: ['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom']
        }
    };

    ScratchExtensions.register('Dalton-AI-Lab', descriptor, ext);
    
    


})({});