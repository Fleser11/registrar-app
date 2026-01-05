import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  @Output() searchChange = new EventEmitter<string>();

  setSearch(event: any): void {
    this.searchChange.emit(event.target.value);
  }


}
