import { Component, Input, Output, OnInit, EventEmitter, HostListener, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.less']
})
export class SliderComponent implements OnInit {
	// View child elements of slider
	@ViewChild("range") range: ElementRef;
	@ViewChild("left") left: ElementRef;
    @ViewChild("right") right: ElementRef;

    // Events for mouse
	@HostListener('document:mousemove', ['$event'])
    onMousemove(event: MouseEvent) {
        console.log('Document', event.type);
        if (this.leftH.pressed) {
        	this.moveHandleLeft(event.pageX);
        }
        if (this.rightH.pressed) {
        	this.moveHandleRight(event.pageX);
        }
    }
	@HostListener('document:mouseup', ['$event'])
    onMouseup(event: MouseEvent) {
        console.log('Document', event.type);
        this.endMoveHandle();
    }
    // Events for touchscreen
    @HostListener('document:touchmove', ['$event'])
    onTouchMove(event:TouchEvent) {
    	console.log('Document', event.type);
        if (this.leftH.pressed) {
        	this.moveHandleLeft(event.changedTouches[0].pageX);
        }
        if (this.rightH.pressed) {
        	this.moveHandleRight(event.changedTouches[0].pageX);
        }
        event.stopPropagation();
    }
    @HostListener('document:touchend')
    onTouchEnd() {
      console.log('Document: ', 'touchend');
      this.endMoveHandle();
    }

    // Max possible value
    @Input() max: number;
    // Event emitter
    @Output() changeRange: EventEmitter<any> = new EventEmitter();

    slider = {
    	elem: null,
    	pageX: null,
    	min: <number> 0,
    	max: <number> null,
    	fix: <number> null // 1/2 of handle width
    }
    leftH = {
    	pressed: <boolean> false,
    	left: <number> 0,
    	value: <number> null
    };
    rightH = {
    	pressed: <boolean> false,
    	right: <number> 0,
    	value: <number> null
    };
    

	constructor(public element: ElementRef ) { 
		this.slider.elem = this.element;
	}

	ngOnInit() {
		this.slider.max = <number> this.max ? this.max : 100;
		this.leftH.value = 0;
		this.rightH.value = this.slider.max;
		// Fix for handle width
		this.slider.fix = 100 * this.left.nativeElement.clientWidth / 2 / this.range.nativeElement.clientWidth;
	}

	onMousedown(event){
		console.log('onMousedown: ', event);
		if (event.target.classList.contains('handle-right')) {
			this.rightH.pressed = true;
		}else{
			this.leftH.pressed = true;
		}
		this.slider.pageX = event.pageX;
		// cancel default behavour
		return false;
	}

	onTouchStart(event){
		console.log('onTouchstart: ', event);
		if (event.target.classList.contains('handle-right')) {
			this.rightH.pressed = true;
		}else{
			this.leftH.pressed = true;
		}
		this.slider.pageX = event.changedTouches[0].pageX;
		event.stopPropagation();
	}

	moveHandleRight(pageX){
		// shift in %
		let shift = (pageX - this.slider.pageX) / this.range.nativeElement.clientWidth;
    	let position = this.rightH.right - shift*100;
    	// set new right position in %
    	if(position < 0) position = 0;
    	if(position > (100 - this.leftH.left)) position = 100 - this.leftH.left;
        this.right.nativeElement.style.right = position - this.slider.fix + '%';
        this.rightH.value = Math.round(this.slider.max*(100-position)/100);        	
	}
	moveHandleLeft(pageX){
		// shift in %
		let shift = (pageX - this.slider.pageX) / this.range.nativeElement.clientWidth;
    	let position = this.leftH.left + shift*100;
    	// set new position in %
    	if (position < 0) position = 0;
    	if (position > (100 - this.rightH.right) ) position = 100 - this.rightH.right;
    	this.left.nativeElement.style.left = (position - this.slider.fix) + '%';
    	this.leftH.value = Math.round(this.slider.max*position/100);
	}
	endMoveHandle(){
		if (this.leftH.pressed || this.rightH.pressed) {
	        this.leftH.left = (this.left.nativeElement.offsetLeft / this.range.nativeElement.clientWidth) * 100;
	        this.rightH.right = ((this.range.nativeElement.clientWidth - this.right.nativeElement.offsetLeft ) / this.range.nativeElement.clientWidth) * 100;
	        this.leftH.pressed = false;
	        this.rightH.pressed = false;
	        this.changeRange.emit({left: this.leftH.value, right: this.rightH.value});
    	}
	}
	// Manual change of left input
	onChangeLeft(leftVal){
		console.log('Entered left: ', leftVal);
		// check  position
		if (this.leftH.value < 0) this.leftH.value = 0;
		if (this.leftH.value > this.rightH.value) this.leftH.value = this.rightH.value;
		// set position
		this.left.nativeElement.style.left = ((this.leftH.value*100/this.slider.max) - this.slider.fix) + '%';
		//save position
		this.leftH.left = (this.left.nativeElement.offsetLeft / this.range.nativeElement.clientWidth) * 100;
		this.changeRange.emit({left: this.leftH.value, right: this.rightH.value});
	}
	// Manual change of right input
	onChangeRight(rightVal){
		console.log('Entered right: ', rightVal);
		// check  position
		if (this.rightH.value < this.leftH.value) this.rightH.value = <number> this.leftH.value;
		if (this.rightH.value > this.slider.max) this.rightH.value = <number> this.slider.max;
		// set position
		this.right.nativeElement.style.right = (100 - this.slider.fix - (this.rightH.value*100/this.slider.max)) + '%';
		//save position
		this.rightH.right = (1-(this.right.nativeElement.offsetLeft / this.range.nativeElement.clientWidth)) * 100;
		this.changeRange.emit({left: this.leftH.value, right: this.rightH.value});
	}

}
