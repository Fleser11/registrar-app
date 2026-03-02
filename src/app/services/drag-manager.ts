import { Directive, Input } from "@angular/core";
import { Observable } from "rxjs";
// import { DropStatus } from "../model/drop-status";

export class DragManager {


    private static currentItem: Draggable;
    private static passBackItem: any;
    private static success: boolean = false;


    static setSuccess(value: boolean): void {
        this.success = value;
    }

    static isSuccessful(): boolean {
        return this.success;
    }

    static setCurrentItem(item: any): void {
        this.currentItem = item;
        //console.log("set current item: " + this.currentItem)
    }

    static getCurrentItem(): any {
        return this.currentItem;
    }

    static setPassBackItem(item: any): void{
        this.passBackItem = item;
    }

    static getPassBackItem(): any{
        return this.passBackItem;
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
        DragManager.setSuccess(false);
        DragManager.setPassBackItem(null);
        //console.log("drag started: success status: " + DragManager.isSuccessful());
    }
    abstract onDragEnd(event: any): void;
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
