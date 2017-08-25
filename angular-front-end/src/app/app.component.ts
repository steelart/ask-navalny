import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,//makes styles global
  styleUrls: ['./app.component.less']
})

export class AppComponent {
  title = 'My first app';
  header: Header = {
  	id: 1,
  	name: "Привет"
  };
  selectedItem: null;
  selectedObj: Header;
  items: Header[] = [
  	{id: 2, name: "Пункт 2"},
  	{id: 3, name: "Пункт 3"},
  	{id: 4, name: "Пункт 4"},
  	{id: 5, name: "Пункт 5"},
  ];
  onClick(item): void {
  	this.selectedItem = item.id;
  	this.selectedObj = item;
  	alert("Selected: " + item.name);
  };
}

// Создаем класс для объекта
class Header {
	id: number;
	name: string;
}
