import { Injectable } from '@angular/core';
import { Answer } from '../classes/answer';
import { QuestionsService } from '../services/questions.service';

@Injectable()
export class AnswersService {

  constructor( private questionService: QuestionsService) { }

  answers: Answer[] = [
		{	"id": 1,
			"questionId": 1,
			"sourceTitle": "Путин и прокуратура на страже швейцарских часов",
			"sourceUrl": "",
			"type": "video",
			"videoId": "qSwBAOADukw",
			"rating": 100,
			"start": 5,
			"end": 7 			},
		{	"id": 2,
			"questionId": 1,
			"sourceTitle": "Сын Пескова из английской тюрьмы в российскую элиту",
			"sourceUrl": "",
			"type": "video",
			"videoId": "tQGSAh8BioY",
			"rating": 100,
			"start": 5,
			"end": 7 			},
		{	"id": 3,
			"questionId": 1,
			"sourceTitle": "Банковская система и передел собственности",
			"sourceUrl": "",
			"type": "video",
			"videoId": "9IxsXt0dHW4",
			"rating": 100,
			"start": 5,
			"end": 7 			},
		{	"id": 4,
			"questionId": 2,
			"sourceTitle": "Кто финансирует младшую дочь Путина",
			"sourceUrl": "",
			"type": "video",
			"videoId": "SH2bbxp46CQ",
			"rating": 100,
			"start": 5,
			"end": 7 			},
		{	"id": 5,
			"questionId": 2,
			"sourceTitle": "Как я заработал на дурачках из Lifenews",
			"sourceUrl": "",
			"type": "video",
			"videoId": "U3RLzg5RL3Y",
			"rating": 100,
			"start": 5,
			"end": 7 			},
		{	"id": 6,
			"questionId": 2,
			"sourceTitle": "Они простили - мы заплатили",
			"sourceUrl": "",
			"type": "video",
			"videoId": "Dywa1SCP3fM",
			"rating": 100,
			"start": 5,
			"end": 7 			},
		{	"id": 7,
			"questionId": 3,
			"sourceTitle": "Кого боятся российские коррупционеры",
			"sourceUrl": "",
			"type": "video",
			"videoId": "-ytC_uLbbOo",
			"rating": 100,
			"start": 30,
			"end": 40 			},
		{	"id": 8,
			"questionId": 3,
			"sourceTitle": "Где берутся деньги и куда они уходят",
			"sourceUrl": "",
			"type": "video",
			"videoId": "jle2YsPnrlg",
			"rating": 100,
			"start": 80,
			"end": 95			},
		{	"id": 9,
			"questionId": 4,
			"sourceTitle": "Как Путин девочку обманул",
			"sourceUrl": "",
			"type": "video",
			"videoId": "cgRe5Gx2h2Q",
			"rating": 100,
			"start": 120,
			"end": 130			}
	];
	
  getAll(){
  	return this.answers;
  }

  getList(id) {
  	//return this.answers;
  	return this.answers.filter((ans: Answer) =>{
  		return ans.questionId == id;
  	})
  }

  // Add new answer to question
  addAnswer(answer: Answer){
  	// find next id
  	let maxIdAnswer = this.answers.reduce((prev,cur) => cur.id>prev.id?cur:prev,{id:-Infinity});
  	console.log('maxIdAnswer: ', maxIdAnswer);
  	answer.id = +maxIdAnswer.id + 1;
  	//push answer
  	console.log('Answers length before: ', this.answers.length);
  	this.answers.push(answer);
  	console.log('Answers length after: ', this.answers.length);
  	this.questionService.updateQuestion(answer.questionId);
  }

}
