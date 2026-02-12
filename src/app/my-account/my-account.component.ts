import { Component } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MessageService } from '../services/message.service';
import { Subject, takeUntil } from 'rxjs';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { SocialUser } from "@abacritt/angularx-social-login";
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent {
  showView: String = "Login";
  private unsubscribe = new Subject<void>();
  user!: SocialUser | null; 
  loggedIn!: boolean;
  sideHead : boolean = false;
  mainHead: String = "Account";
  sideLabel: String = "";
  selectedOrder : any = {};
  constructor (private messageService: MessageService,
    private authService: SocialAuthService,private route: ActivatedRoute, public router:Router){
    this.messageService
		.getMessage()
		.pipe(takeUntil(this.unsubscribe))
		.subscribe((data) => {
      let temp = localStorage.getItem("loggedIn");
      let order = localStorage.getItem("orderDetail");
      this.selectedOrder = order ? JSON.parse(order) : {};
      this.loggedIn = temp ? true: false;
      if(data && data.key ){
        this.showView = data.key
      }else if(data && data.sideKey){
        this.sideHead = true;
        this.sideLabel = data.sideKey;
        this.router.navigate([], { queryParams: { id: data.sideKey }, queryParamsHandling: 'merge' });
        
      }
      // else{
      //   this.showView = "Login"
      // }
		});
    this.authService.authState.subscribe((user) => {
      setTimeout(()=>{
        this.ngOnInit();
      },1000)
    });
    
  }

  ngOnInit() {
    let temp = localStorage.getItem("loggedIn");
    this.loggedIn = temp ? true: false;
    // this.loggedIn = true;
    this.showView =( this.loggedIn) ? "Account":"Login";
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
      // this.showView = this.loggedIn ? "Account" : "Login"
      // console.log(user,">>>USER")
    });

    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];

      if (params['id']) {
        this.sideHead = true;
        this.sideLabel = params['id'];
      } else {
        this.sideHead = false;
        this.sideLabel = "";
        if (mode === 'login') {
          // Show login form
          this.showView = 'Login'
        } else if (mode === 'register') {
          this.showView = "Register"
        }
      }
    });
  }

  redirect(){
    this.sideHead = false;

    // this.messageService.sendMessage({fromOrderView:true});
  }
  redirectOrder() {
    this.sideHead = false;

    let obj = {
      sideKey:"Orders"
    }
    this.messageService.sendMessage(obj);
  }
}
