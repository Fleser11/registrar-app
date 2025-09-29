import { Directive, Input } from "@angular/core";
import { Observable } from "rxjs";
// import { DropStatus } from "../model/drop-status";

export class DragManager {


    currentItem: any;
    static currentItem: Draggable;


    static setCurrentItem(item: any): void {
        this.currentItem = item;
        console.log("set current item: " + this.currentItem)
    }

    static getCurrentItem(): any {
        return this.currentItem;
    }
}




@Directive()
export abstract class Draggable{
    data: any;
    id: string | null = null;
    public locked: boolean = false;
    onDragStart(event: any, data: any): void{
        this.data = data;
        DragManager.setCurrentItem(this);
    }
    abstract onDrop(event: any): any;
    onDragOver(event: any): void{
        if(this.locked){}
        else if(this.id==null){
            event.preventDefault();
        }
        else if(this.id == DragManager.getCurrentItem()){
            event.preventDefault();
        }
    }


}
