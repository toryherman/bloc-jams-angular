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
        * @desc Randomly ordered array of album songs
        * @type {Array}
        */
        var randomAlbum = [];
        
        /**
        * @desc Buzz object audio file
        * @type {Object}
        */
        var currentBuzzObject = null;
        
        
        /** PRIVATE FUNCTIONS **/
        
        /**
        * @function setSong
        * @desc Stops currently playing song and loads new audio file as currentBuzzObject; sends GA info if song plays full duration
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
					if (currentBuzzObject) {
                        SongPlayer.currentTime = currentBuzzObject.getTime();

                        if (SongPlayer.currentTime === SongPlayer.currentSong.duration) {
                            ga('send', {
                                hitType: 'event', 
                                eventCategory: 'Song', 
                                eventAction: 'play', 
                                eventLabel: song.title
                            });

                            SongPlayer.next();
                        }
                    }
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
            currentBuzzObject = null;
			song.playing = null;
            SongPlayer.currentSong = null;
            SongPlayer.currentTime = null;
        };
        
        /**
        * @function getSongIndex
        * @desc Gets index of song from the songs array in currentAlbum object
        * @param {Object} song
        */
        var getSongIndex = function(song) {
            if (SongPlayer.shuffle) {
                return randomAlbum.indexOf(song);   
            } else {
                return currentAlbum.songs.indexOf(song);  
            }
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
		
		/**
		* @desc Previous volume
		* @type {Number}
		*/
		SongPlayer.lastVolume = null;		
		
		/**
		* @desc Shuffle order of song playback
		* @type {Boolean}
		*/
		SongPlayer.shuffle = null;
		
		/**
		* @desc Loop through all songs continuously
		* @type {Boolean}
		*/
		SongPlayer.loop = null;

        
        /** PUBLIC FUNCTIONS **/
        
        /**
        * @function SongPlayer.play (method)
        * @desc Executes setSong and playSong functions
        * @param {Object} song
        */
        SongPlayer.play = function(song) {
            if (!song && !SongPlayer.currentSong) {
                if (SongPlayer.shuffle) {
                    song = randomAlbum[0];
                } else {
                    song = currentAlbum.songs[0];
                }
            } else {
                song = song || SongPlayer.currentSong;	
            }
			
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
				if (SongPlayer.loop) {
                    if (SongPlayer.shuffle) {
                        var song = randomAlbum[randomAlbum.length - 1];
                    } else {
                        var song = currentAlbum.songs[currentAlbum.songs.length - 1];    
                    }
					
					SongPlayer.play(song);
				} else {
					stopSong();
				}
            } else {
                if (SongPlayer.shuffle) {
                    var song = randomAlbum[currentSongIndex];
                } else {
                    var song = currentAlbum.songs[currentSongIndex];
                }
                
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
				if (SongPlayer.loop) {
                    if (SongPlayer.shuffle) {
                        var song = randomAlbum[0];
                    } else {
                        var song = currentAlbum.songs[0];    
                    }
					
					SongPlayer.play(song);
				} else {
					stopSong();
				}
            } else {
                if (SongPlayer.shuffle) {
                    var song = randomAlbum[currentSongIndex];
                } else {
                    var song = currentAlbum.songs[currentSongIndex];
                }
                
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
			}
			
			SongPlayer.volume = value;
		};
		
		/**
		* @function muteVolume
		* @desc Store previous volume and set volume to 0
		*/
		SongPlayer.muteVolume = function() {
			SongPlayer.lastVolume = SongPlayer.volume;
			SongPlayer.setVolume(0);
		};
        
        /**
        * @function setShuffle
        * @desc Turns shuffle on/off and fills randomAlbum
        */
        SongPlayer.setShuffle = function() {
            SongPlayer.shuffle = !SongPlayer.shuffle;
            
            if (!SongPlayer.shuffle) {
                randomAlbum = [];
            }
                
            if (SongPlayer.shuffle) {
                if (SongPlayer.currentSong) {
                    randomAlbum.push(SongPlayer.currentSong);   
                }
                
                while (randomAlbum.length < currentAlbum.songs.length) {
                    var randomSong = currentAlbum.songs[Math.floor(Math.random() * currentAlbum.songs.length)];
                    
                    if (randomAlbum.indexOf(randomSong) === -1) {
                        randomAlbum.push(randomSong);
                    }
                }
            }
        }

        return SongPlayer;
    }
    
    angular
        .module('blocJams')
        .factory('SongPlayer', ['$rootScope', 'Fixtures', SongPlayer]);
})();