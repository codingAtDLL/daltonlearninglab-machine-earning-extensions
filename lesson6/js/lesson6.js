(function(ext) {
    

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

    ext.initReversi = function(pSize) {
        if (window.game != null) return;
        window.game = new window.Reversi({
            grid: pSize,
            players: [
                new window.Player({
                    persist: false,
                    isSmart: true,
                    id: 'Smart'
                }),
                new window.Player({
                    id: 'Kinda Smart',
                    persist: false,
                    isComputer: true,
                    isSmart: true,
                    discover: 0.5
                })
            ]
        });
    }

    ext.startTraining = function() {
        if (window.game != null)
            window.game.startTraining();
    }

    ext.stopTraining = function() {
        if (window.game != null)
            window.game.stopTraining();
    }

    ext.getTrainedGameCount = function() {
        if (window.game != null) {
            return window.game.totalGames;
        }
        return 0;
    }

    ext.getBoard = function() {
        if (window.game != null) {
            var result = "";
            for (var i=0;i<window.game.grid;i++) {
                for (var j=0;j<window.game.grid;j++) {
                    result += window.game.board[i][j]==null?"-":window.game.board[i][j];
                }
            }
            return result;
        }

        return "";
    }

    ext.selectSquare = function(pX, pY) {
        if (window.game != null) {
            if (pX > 0 && pX <= window.game.grid && pY >0 && pY <= window.game.grid) {
                pMove = (pX-1) + "|" + (pY-1);
                window.game.selectSquare(window.game.currentPlayer, pMove);
            }
        }
    }

    ext.whenXWon = function() {
        if (window.game == null) return false;

       // Reset alarm_went_off if it is true, and return true
       // otherwise, return false.
       if (window.game.xWonFlag) {
           window.game.xWonFlag = false;
           return true;
       }

       return false;
    };

    ext.whenOWon = function() {
        if (window.game == null) return false;
       // Reset alarm_went_off if it is true, and return true
       // otherwise, return false.
       if (window.game.oWonFlag) {
           window.game.oWonFlag = false;
           return true;
       }
       return false;
    };

    ext.whenDraw = function() {
        if (window.game == null) return false;
       // Reset alarm_went_off if it is true, and return true
       // otherwise, return false.
       if (window.game.drawFlag) {
           window.game.drawFlag = false;
           return true;
       }
       return false;
    };

    ext.resetGame = function(callback) {
        if (window.game == null) {
            callback();
            return;
        }
        if (window.game.training) {
            callback();
        }
        else {
            window.game.reset();
            setTimeout(callback, 100);
        }
    }

    var descriptor = {
        blocks: [
            [' ', 'init Reversi AI size %s', 'initReversi', '4'],
            [' ', 'start training', 'startTraining'],
            [' ', 'stop training', 'stopTraining'],
            ['r', 'get trained game count', 'getTrainedGameCount'],
            ['r', 'get board', 'getBoard'],
            [' ', 'make a move ( %s , %s )', 'selectSquare', '1', '1'],
            ['h', 'When X won', 'whenXWon'],
            ['h', 'When O won', 'whenOWon'],
            ['h', 'When draw', 'whenDraw'],
            ['w', 'reset game', 'resetGame']
        ]
    };

    ScratchExtensions.register('Dalton-Reversi', descriptor, ext);
    
    


})({});