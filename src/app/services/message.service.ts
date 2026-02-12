import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class MessageService {

    private subject = new Subject<any>();
    private subject2 = new Subject<any>();

    sendMessage(data: any) {
        this.subject.next(data);
    }
    
    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    sendMessageCategory(data: any) {
        this.subject2.next(data);
    }

    getMessageCategory(): Observable<any> {
        return this.subject2.asObservable();
    }
}