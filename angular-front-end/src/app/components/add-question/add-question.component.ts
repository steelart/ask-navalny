import { Component, OnInit } from '@angular/core';
import { Question } from '../../classes/question';
import { QuestionsService } from '../../services/questions.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


@Component({
  selector: 'app-add-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.less']
})
export class AddQuestionComponent implements OnInit {
  questionNew: Question;

  // form inputs
  form: any = {
  	questionText: ''
  }

  constructor(	private router: Router,
  				private questionsService: QuestionsService	) { }

  ngOnInit() {
  }

  onSubmit(){
  	if(!this.form.questionText) {
  		return false;
  	};
  	//make new question
  	this.questionNew = {
  		"id": null,
		"title": this.form.questionText,
		"date": null,
		"answers": 0,
		"rating": 0,
		"views": 0
  	}
  	// add new answer
	let id = this.questionsService.addQuestion(this.questionNew);
  	// redirect to question page
  	this.router.navigateByUrl("/question/" + id);

  }

  onBackStep(){
  	this.router.navigateByUrl("/main");
  }

}
