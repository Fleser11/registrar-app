import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  @Input() value: string = '';
  @Output() searchChange = new EventEmitter<string>();

  setSearch(event: any): void {
    this.value = event.target.value;
    this.searchChange.emit(this.value);
  }


}
