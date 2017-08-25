import { Injectable } from '@angular/core';
import { Question } from '../classes/question';

@Injectable()
export class QuestionsService {

  constructor() { }

  questions: Question[] = [
		{	"id": 1, 
			"title": "Откуда деньги у Навального?", 
			"date": new Date(2017, 7, 10),//'10.08.2017',
			"answers": 3,
			"rating": 80,
			"views": 700		},
		{	"id": 2, 
			"title": "Что делать с Кавказом?", 
			"date": new Date(2017, 7, 5),//'5.08.2017',
			"answers": 3,
			"rating": 100,
			"views": 1000		},
		{	"id": 3, 
			"title": "Как реформировать суды?", 
			"date": new Date(2017, 7, 15),//'15.08.2017'
			"answers": 3,
			"rating": 200,
			"views": 900		},
		{	"id": 4, 
			"title": "Кто будет платить пенсии?", 
			"date": new Date(2017, 6, 10),
			"answers": 1,
			"rating": 5,
			"views": 800		},
		{	"id": 5, 
			"title": "Где взял деньги на избирательную кампанию?", 
			"date": new Date(2017, 6, 11),//'15.08.2017'
			"answers": 0,
			"rating": 150,
			"views": 850		},
		{	"id": 6, 
			"title": "Сколько тебе заплатил госдеп?", 
			"date": new Date(2017, 6, 12),//'15.08.2017'
			"answers": 0,
			"rating": 2,
			"views": 920		},
		{	"id": 7, 
			"title": "Чей Крым - наш или не наш?", 
			"date": new Date(2017, 6, 13),//'15.08.2017'
			"answers": 0,
			"rating": 5000,
			"views": 200		},
		{	"id": 8, 
			"title": "Донбасс будешь сливать или нет?", 
			"date": new Date(2017, 6, 20),//'15.08.2017'
			"answers": 0,
			"rating": 190,
			"views": 100		},
		{	"id": 9, 
			"title": "Как реформировать правоохранительные органы?", 
			"date": new Date(2017, 7, 2),//'15.08.2017'
			"answers": 0,
			"rating": 10,
			"views": 1000		},
		{	"id": 10, 
			"title": "Что за люстрация и зачем?", 
			"date": new Date(2017, 7, 3),//'15.08.2017'
			"answers": 0,
			"rating": 2,
			"views": 1		}
	];

  // Get all questions list
  getList() {  	
	return this.questions;
  }

  // Get question by id
  getQuestion(id){
  	return this.questions.find((q) => q.id == id);
  }

  addQuestion(questionNew: Question){
  	// find next id
  	let maxIdQuestion = this.questions.reduce((prev,cur) => cur.id>prev.id?cur:prev,{id:-Infinity});
  	console.log('maxIdQuestion: ', maxIdQuestion);
  	questionNew.id = +maxIdQuestion.id + 1;
  	let date = new Date();
  	questionNew.date = new Date();
  	//push answer
  	console.log('Questions length before: ', this.questions.length);
  	this.questions.push(questionNew);
  	console.log('Questions length after: ', this.questions.length);
  	console.log('New question: ', this.getQuestion(questionNew.id));
  	return questionNew.id;
  }

  getListByRating(){
  	return this.questions.sort((a, b)=>{return b.rating - a.rating});
  }
  getListByDate(){
  	return this.questions.sort((a, b)=>{
		return b.date > a.date ? 1 : -1;
	});	
  }
  getListUnanswered(){
  	return this.questions.filter((q)=>{return q.answers == 0});
  }
  updateQuestion(id){
  	let index = this.questions.findIndex((q) => q.id == id);
  	this.questions[index].answers ++;
  }
 
}
