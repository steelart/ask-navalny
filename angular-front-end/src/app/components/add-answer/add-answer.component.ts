import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Question } from '../../classes/question';
import { Answer } from '../../classes/answer';
import { QuestionsService } from '../../services/questions.service';
import { AnswersService } from '../../services/answers.service';
import { YoutubeService } from '../../services/youtube.service';


@Component({
  selector: 'app-add-answer',
  providers: [YoutubeService],
  templateUrl: './add-answer.component.html',
  styleUrls: ['./add-answer.component.less']
})
export class AddAnswerComponent implements OnInit {
  question: Question;
  answers: Answer[];
  step: number;
  newAnswer: Answer;
  videoParams: any = {
  	videoId: null,
  	duration: null,
  	start: null,
  	end: null
  };
  // form inputs
  form: any = {
  	videoLink: '',
  	description: ''
  };
  //time: any;
  constructor(	private route: ActivatedRoute,
  				private router: Router,
  				private questionsService: QuestionsService,
  				private answersService: AnswersService,
  				private youtubeService: YoutubeService	) {
  	// Получаем длительность видео из плеера
  	youtubeService.duration$.subscribe(
	    num => {
	        this.videoParams.duration = num;
			this.videoParams.start = 0;
	        this.videoParams.end = num;
    });
  }

  ngOnInit() {
  	// router parameters
  	this.route.params.subscribe(
        params =>{
            //this.questionId = parseInt(params['id']);
            // getting question by questionID
            this.question = this.questionsService.getQuestion(parseInt(params['id']));
            // getting answers for questionID
            this.answers = this.answersService.getList(parseInt(params['id']));
            //this.youtubeService.playList(this.answers);
        }
    );

  	this.step = 1;
  }

  onCancel(){
  	this.router.navigateByUrl("/question/" + this.question.id);
  }
  // Next step
  onNextStep(valid){
  	console.log('valid: ', valid);
  	if (valid) {
  		if(this.form.videoLink.indexOf("?") == -1){
  			alert('Указана некорректная ссылка');
  			return false;
  		}
  		let videoId: string = '';
  		let query: string = this.form.videoLink.split('?')[1];
  		query.split('&').forEach(function(part){
  			if (part.indexOf("=") > -1 && part.split('=')[0] == 'v') {
  				videoId = part.split('=')[1].trim();
  			}  			
  		});
  		console.log('result: ', videoId);
  		if (videoId) {
  			// load video
  			this.videoParams.videoId = videoId;
  			this.step = 2;
  			this.youtubeService.playVideo(videoId);
  			
  		}else{
	  		alert('Указана некорректная ссылка');
	  	}	  	
  	}
  	return false;
  }

  onBackStep(){
  	this.videoParams = {
	  	videoId: null,
	  	duration: null,
	  	start: null,
	  	end: null
	 };
	 this.youtubeService.destroyPlayer();
	 this.step = 1;
  }
  
  // Add new answer to question
  addAnswer(){
  	if(!this.videoParams.videoId || this.videoParams.start == null || this.videoParams.end == null || !this.form.description) return false;
  	//make new answer
  	this.newAnswer = {
  		"id": null,
		"questionId": this.question.id,
		"sourceTitle": this.form.description,
		"sourceUrl": '',
		"type": "video",
		"videoId": this.videoParams.videoId,
		"rating": 0,
		"start": this.videoParams.start,
		"end": this.videoParams.end,
  	}
  	// add new answer
	this.answersService.addAnswer(this.newAnswer);
	this.answers = this.answersService.getList(this.question.id);
  	// redirect to question page
  	this.router.navigateByUrl("/question/" + this.question.id);
  }

  // Range is changed
  onChangeRange(event){
  	console.log('onChangeRange: ', event);
  	this.videoParams.start = parseInt(event.left);
  	this.videoParams.end = parseInt(event.right);
  	this.youtubeService.reloadVideo(parseInt(event.left), parseInt(event.right));
  }

  getDuration(){
  	console.log('Duration: ', this.youtubeService.getDuration());
  }

   ngOnDestroy() {
		this.youtubeService.destroyPlayer();
   }


}
