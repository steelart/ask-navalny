import { Injectable, NgZone } from '@angular/core';
import { Answer } from '../classes/answer';
import { Subject }    from 'rxjs/Subject';

@Injectable()
export class YoutubeService {
	private iframeScriptId: string = "yt-iframe-api-script";
	youtube: any = {
		ready: false,
	    player: null,
	    playerId: "yt-iframe-api",
	    videoId: "M7lc1UVf-VE",
	    videoTitle: null,
	    playerHeight: '450',
	    playerWidth: '100%',
	    autoplay: 1,
	    mode: '', // single or playlist
	    start: null,
	    end: null,
	    current: null
	};
	answers: Answer[];
	// Observable string source
	private currentVideo = new Subject<number>();
	private duration = new Subject<number>();
	// Observable string stream
  	currentVideo$ = this.currentVideo.asObservable();
  	duration$ = this.duration.asObservable();

	constructor(private zone: NgZone) { }

	// Show one video - for adding new answer
	playVideo(videoId){
		if(!videoId) return false;
		console.log('Play video start: ' + videoId);
		//this.youtube.player = null;
		this.youtube.videoId = videoId;
		this.youtube.mode= 'single';
		this.youtube.autoplay = 0;
		this.youtube.current = 0;
		this.currentVideo.next(0);
		this.loadApi();
	}

	// Play list of answers
	playList(ans: Answer[]){
		if(ans.length == 0 || !ans[0].videoId) return false;
		this.answers = ans;
		console.log('answers', this.answers);
		//this.youtube.player = null;
		this.youtube.videoId = this.answers[0].videoId;
		this.youtube.mode = 'playlist';
		this.youtube.autoplay = 1;
		this.youtube.start = this.answers[0].start;
		this.youtube.end = this.answers[0].end;
		this.youtube.current = 0;
		this.currentVideo.next(0);
		this.loadApi();
	}
	/**
     * Load the Youtube iframe API into the DOM to get access.
     * Stream the YT object to inform all listeners when it's ready.
     */
    loadApi() {
    	console.log('Load API start');
        // Load API only once
        if( window.document.getElementById(this.iframeScriptId) == null ) {
            // Create scripte element and load API
            let apiScriptTag = window.document.createElement("script");
            apiScriptTag.type = "text/javascript";
            apiScriptTag.src = "https://www.youtube.com/iframe_api";
            apiScriptTag.id = this.iframeScriptId;
            window.document.body.appendChild(apiScriptTag);
        } // END OF if( window.document.getElementById(this.iframeScriptId) == null ) { ... }
        else{
        	console.log('API found');
        	/*if(this.youtube.player){
        		this.reloadVideo(null);
        	}else{*/
	        	this.youtube.player = this.createPlayer();
	        	console.log('Player created: ', this.youtube.player);
	        //}
        }

        // create video player when API is ready
        window['onYouTubeIframeAPIReady'] = () => {
            console.log('Youtube API is ready');
	        this.youtube.player = this.createPlayer();
	        console.log('Player created: ', this.youtube.player);
        };
    };

    createPlayer(): void {
    	console.log('Create player start');
    	let self: any = this;
    	let done: boolean = false;
    	let player: any;
    	let state: number;
	    function onPlayerReady(ev){
	    	console.log('onPlayerReady-func', ev);
	    	self.duration.next(player.getDuration());
	    	if(self.youtube.mode == 'playlist') ev.target.playVideo();
	    };
	    function onPlayerStateChange(ev){
	    	console.log('onPlayerStateChange-func', ev);
	        // Если воспризведение завершено (и предыдущее состояние не -1)
	        if(ev.data == 0 && state != -1 && self.youtube.mode == 'playlist'){
	        	console.log('Video end');
	        	self.nextVideo();
	        }
	        state = ev.data;
	    };
	    function stopVideo() {
	    	console.log('Stop Video');
			player.stopVideo();
	    }

	    console.log('Youtube params: ', self.youtube);
	    //window['YT'].get(self.youtube.playerId) ||
	    player = new window['YT'].Player(self.youtube.playerId, {
	      height: self.youtube.playerHeight,
	      width: self.youtube.playerWidth,
	      videoId: self.youtube.videoId,
	      playerVars: {
	        //rel: 0,
	        //showinfo: 0,
	        start: self.youtube.start,
	        end: self.youtube.end,
	        autoplay: self.youtube.autoplay,
	        controls: 1,
	        //listType:'playlist',
	        //playlist: "z9pr22fnZKk, bKyX3KNPH6s"
	      },
	      events: {
            'onReady': (ev) => self.zone.run(() => onPlayerReady(ev)),
            'onStateChange': (ev) => self.zone.run(() => onPlayerStateChange(ev))
          }
		});

		return player;
	}

	// Следующее видео
	nextVideo(){
		if (this.youtube.current < (this.answers.length - 1) && this.youtube.current != null) {
			this.youtube.current ++;
			this.currentVideo.next(this.youtube.current);
			console.log("Load video: ", this.youtube.current);
			console.log("Title video: ", this.answers[this.youtube.current].sourceTitle);
			this.youtube.player.pauseVideo();
			this.youtube.player.loadVideoById({
	    		videoId: this.answers[this.youtube.current].videoId,
	            startSeconds: this.answers[this.youtube.current].start,
	            endSeconds: this.answers[this.youtube.current].end,
	        })
		}
	}

	// Предыдущее видео
	previousVideo(){
		if (this.youtube.current > 0  && this.answers.length > 0) {
			this.youtube.current --;
			this.currentVideo.next(this.youtube.current);
			this.youtube.player.pauseVideo();
			this.youtube.player.loadVideoById({
	    		videoId: this.answers[this.youtube.current].videoId,
	            startSeconds: this.answers[this.youtube.current].start,
	            endSeconds: this.answers[this.youtube.current].end,
	        })
		}
	}

	getDuration(){
		return this.youtube.player.getDuration();
	}
	seekTo(start: number){
		this.youtube.start = start;
		this.youtube.player.seekTo(start);
	}

	//reload video with new end time parameter
	reloadVideo(start: number, end: number){
		this.youtube.start = start;
		this.youtube.end = end;
		this.youtube.player.loadVideoById({
			videoId:this.youtube.videoId,
            startSeconds:this.youtube.start,
            endSeconds:this.youtube.end
        })
	}

	destroyPlayer(){
		if(window['YT'] != null && window['YT'].get(this.youtube.playerId) != null){
			window['YT'].get(this.youtube.playerId).destroy();
		}
		this.youtube.player = null;
	}

}
