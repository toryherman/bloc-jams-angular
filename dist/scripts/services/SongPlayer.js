(function() {
    function SongPlayer($rootScope, Fixtures) {
        var SongPlayer = {};

        
        /** PRIVATE ATTRIBUTES **/
        
        /**
        * @desc Sets currentAlbum using getAlbum function
        * @type {Object}
        */
        var currentAlbum = Fixtures.getAlbum();
        
        /**
        * @desc Buzz object audio file
        * @type {Object}
        */
        var currentBuzzObject = null;
        
        
        /** PRIVATE FUNCTIONS **/
        
        /**
        * @function setSong
        * @desc Stops currently playing song and loads new audio file as currentBuzzObject
        * @param {Object} song
        */
        var setSong = function(song) {
            if (currentBuzzObject) {
                stopSong();
            }
            
            currentBuzzObject = new buzz.sound(song.audioUrl, {
                formats: ['mp3'],
                preload: true
            });
			
			currentBuzzObject.bind('timeupdate', function() {
				$rootScope.$apply(function() {
					SongPlayer.currentTime = currentBuzzObject.getTime();
				});
			});
            
            SongPlayer.currentSong = song;
			SongPlayer.setVolume(SongPlayer.volume);
        };
        
        /**
        * @function playSong
        * @desc Plays song and sets song.playing value to true
        * @param {Object} song
        */
        var playSong = function(song) {
            currentBuzzObject.play();
            song.playing = true;
        };
        
		
		/**
		* @function stopSong
		* @desc Stops song and sets song.play value to null
		* @param {Object} song
		*/
        var stopSong = function(song) {
			song = song || SongPlayer.currentSong;
			currentBuzzObject.stop();
			song.playing = null;
        };
        
        /**
        * @function getSongIndex
        * @desc Gets index of song from the songs array in currentAlbum object
        * @param {Object} song
        */
        var getSongIndex = function(song) {
            return currentAlbum.songs.indexOf(song);  
        };
        
        
        /** PUBLIC ATTRIBUTES **/
        
        /**
        * @desc Song object
        * @type {Object}
        */
        SongPlayer.currentSong = null;
        
		/**
		* @desc Current playback time (in seconds) of currently playing song
		* @type {Number}
		*/
		SongPlayer.currentTime = null;
		
		/**
		* @desc Volume
		* @type {Number}
		*/
		SongPlayer.volume = 80;
        
        /** PUBLIC FUNCTIONS **/
        
        /**
        * @function SongPlayer.play (method)
        * @desc Executes setSong and playSong functions
        * @param {Object} song
        */
        SongPlayer.play = function(song) {
            song = song || SongPlayer.currentSong;
            if (SongPlayer.currentSong !== song) {
                setSong(song);
                playSong(song);
            } else if (SongPlayer.currentSong === song) {
                if (currentBuzzObject.isPaused()) {
                    playSong(song);
                } 
            }
        };
        
        /**
        * @function SongPlayer.pause (method)
        * @desc Pauses current song
        * @param {Object} song
        */
        SongPlayer.pause = function(song) {
            song = song || SongPlayer.currentSong;
            currentBuzzObject.pause();
            song.playing = null;
        };
        
        /**
        * @function SongPlayer.previous (method)
        * @desc Changes song to previous song in songs array in currentAlbum
        */
        SongPlayer.previous = function() {
            var currentSongIndex = getSongIndex(SongPlayer.currentSong);
            currentSongIndex--;
            
            if (currentSongIndex < 0) {
                stopSong();
            } else {
                var song = currentAlbum.songs[currentSongIndex];
                SongPlayer.play(song);
            }
        };    
                
        /**
        * @function SongPlayer.next (method)
        * @desc Changes song to next song in songs array in currentAlbum
        */
        SongPlayer.next = function() {
            var currentSongIndex = getSongIndex(SongPlayer.currentSong);
            currentSongIndex++;
            
            if (currentSongIndex === currentAlbum.songs.length) {
                stopSong();
            } else {
                var song = currentAlbum.songs[currentSongIndex];
                SongPlayer.play(song);
            }
        };
		
		/**
		* @function setCurrentTime
		* @desc Set current time (in seconds) of currently playing song
		* @param {Number} time
		*/
		SongPlayer.setCurrentTime = function(time) {
			if (currentBuzzObject) {
				currentBuzzObject.setTime(time);
			}
		};
        
		/**
		* @function setVolume
		* @desc Set the volume
		* @param {Number} value
		*/
		SongPlayer.setVolume = function(value) {
			if (currentBuzzObject) {
				currentBuzzObject.setVolume(value);
				SongPlayer.volume = value;
			}
		};
		
        return SongPlayer;
    }
    
    angular
        .module('blocJams')
        .factory('SongPlayer', ['$rootScope', 'Fixtures', SongPlayer]);
})();