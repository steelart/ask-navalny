import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

//import 'rxjs/add/operator/switchMap';
//import { Observable } from 'rxjs/Observable';

import { Question } from '../../classes/question';
import { Answer } from '../../classes/answer';
import { QuestionsService } from '../../services/questions.service';
import { AnswersService } from '../../services/answers.service';
import { YoutubeService } from '../../services/youtube.service';

@Component({
  selector: 'app-question',
  providers: [/*QuestionsService, AnswersService,*/ YoutubeService],
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.less']
})
export class QuestionComponent implements OnInit {
  
  questionId: number;
  question: Question;
  questionsAll: Question[];
  answers: Answer[];
  currentVideo: number;
  searchQuery: string = null;
  
  constructor(	private route: ActivatedRoute,
   				private router: Router,
  				private questionsService: QuestionsService,
  				private answersService: AnswersService,
  				private youtubeService: YoutubeService	) { 
  	// Получаем полный список вопросов
  	this.questionsAll = questionsService.getList();
  	// Получаем текущее видео из плеера
  	youtubeService.currentVideo$.subscribe(
	    num => {
	        this.currentVideo = num;
    });
  }
  

  ngOnInit() {
  	// router parameters
  	this.route.params.subscribe(
        params =>{
            this.questionId = parseInt(params['id']);
            // getting question by questionID
            this.question = this.questionsService.getQuestion(parseInt(params['id']));
            // getting answers for questionID
            this.answers = this.answersService.getList(parseInt(params['id']));
            if (this.answers.length > 0) {
            	this.youtubeService.playList(this.answers);
            }
            
        }
    );
  }

  nextVideo(): void{
  	this.youtubeService.nextVideo();
  }
  previousVideo(): void{
  	this.youtubeService.previousVideo();
  }
  addAnswer(){
  	this.router.navigateByUrl('add-answer/' + this.question.id);
  }

  getAllAnswers(){
  	let all = this.answersService.getAll();
  	console.log('All answers: ', all.length);
  }
  beforeLeave(){
  	this.searchQuery = null;
  	this.ngOnDestroy();
  }
  ngOnDestroy(){
  	console.log('onDestroy');
  	this.youtubeService.destroyPlayer();
  }

}
