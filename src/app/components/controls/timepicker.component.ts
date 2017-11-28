import { Component, forwardRef, Renderer2, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const TIME_PICKER_VALUE_ACCESSOR : any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TimePickerComponent),
  multi: true,
};

@Component({
  selector: 'timey-timepicker',
  providers: [TIME_PICKER_VALUE_ACCESSOR],
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss']
})
export class TimePickerComponent implements ControlValueAccessor {

  hour: string
  minute: string

  hours: string[] = []
  minutes: string[] = []
  
  disabled = false
  onChange;
  onTouched;
  
  constructor( private renderer : Renderer2 ) {
    for(var i = 0; i < 24; i++){
      this.hours.push(this.addZeroPrefix(i))
    }
    for(var x = 0; x < 60; x++){
      this.minutes.push(this.addZeroPrefix(x))
    }
  }

  private addZeroPrefix(num: number): string{
    if(num < 10)
      return `0${num}`
    else
      return num.toString()
  }
  
  writeValue( value : any ) : void {
    let date = <Date> value
    this.hour = this.addZeroPrefix(date.getHours())
    this.minute = this.addZeroPrefix(date.getMinutes())
  }

  registerOnChange( fn : any ) : void {
    this.onChange = fn;
  }

  registerOnTouched( fn : any ) : void {
    this.onTouched = fn;
  }

  setDisabledState( isDisabled : boolean ) : void {
    this.disabled = isDisabled
  }

  change( $event ) {
    let time = new Date()
    time.setHours(+this.hour)
    time.setMinutes(+this.minute)
    this.onChange(time);
    this.onTouched(time);
  }

}
