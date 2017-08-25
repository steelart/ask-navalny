import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'questionByTitle'
})
export class QuestionByTitlePipe implements PipeTransform {

  transform(value: any, input: any): any {
  	//console.log(input);
  	if (input) {
        input = input.toLowerCase();
        return value.filter(function (el: any) {
            return el.title.toLowerCase().indexOf(input) > -1;
        })
    }
    return value;
    //return null;
  }

}
