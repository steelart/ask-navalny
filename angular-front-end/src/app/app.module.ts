import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
//Components
import { AppComponent } from './app.component';
import { MainComponent } from './components/main/main.component';
import { QuestionComponent } from './components/question/question.component';
import { AddQuestionComponent } from './components/add-question/add-question.component';
import { AddAnswerComponent } from './components/add-answer/add-answer.component';
//Services
import { QuestionsService } from './services/questions.service';
import { AnswersService } from './services/answers.service';
//Pipes
import { QuestionByTitlePipe } from './pipes/question-by-title.pipe';
//Slider
import { SliderComponent } from './components/slider/slider.component';

//Routs
const appRoutes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'question/:id', component: QuestionComponent },
  { path: 'add-question', component: AddQuestionComponent },
  { path: 'add-answer/:id', component: AddAnswerComponent },
  { path: '',
    redirectTo: '/main',
    pathMatch: 'full'
  },
  //{ path: '**', component: PageNotFoundComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    QuestionComponent,
    AddQuestionComponent,
    AddAnswerComponent,
    QuestionByTitlePipe,
    SliderComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true }
    ),
    BrowserModule,
    FormsModule
  ],
  providers: [QuestionsService, AnswersService],
  bootstrap: [AppComponent]
})
export class AppModule { }
