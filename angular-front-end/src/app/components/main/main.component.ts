import { Component, OnInit } from '@angular/core';
import { QuestionsService } from '../../services/questions.service';
import { Question } from '../../classes/question';


@Component({
  selector: 'app-main',
  providers: [],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {
	questions: Question[];
	questionsSorted: Question[];
	searchQuery: "";
	sort = 'rating';
	constructor(private questionsService: QuestionsService) {
		this.questions = questionsService.getList();
		this.questionsSorted = this.questionsService.getListByRating();
	}

	ngOnInit() {
	}

	sortByRating(){
		this.questionsSorted = this.questionsService.getListByRating();
		this.sort = 'rating'
		return false;
	}
	sortByDate(){
		this.questionsSorted = this.questionsService.getListByDate();
		this.sort = 'date'
		return false;
	}
	sortUnanswered(){
		this.questionsSorted = this.questionsService.getListUnanswered();
		this.sort = 'unanswered'
		return false;
	}

}
