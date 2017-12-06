import { Component, OnInit } from '@angular/core'
import {ActivatedRoute, Router} from "@angular/router"

import {AngularFireAuth} from "angularfire2/auth"
import { AngularFirestore } from 'angularfire2/firestore';

import { AuthService } from 'app/services/auth.service'
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'timey-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email = new FormControl('', [Validators.required, Validators.email])
  password = new FormControl('', [Validators.required])
  hide = true

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private afAuth: AngularFireAuth,

    private snackBar: MatSnackBar
  ) { }
  
  emailErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
        this.email.hasError('email') ? 'Not a valid email' :
            '';
  }

  ngOnInit() {
    this.afAuth.authState.take(1).subscribe(response => {
      if(response && response.email)
        this.router.navigate([''])
    })
  }

  checkCreds(): boolean {
    if(!this.email.valid || !this.password.valid){
      this.snack("Please complete the form")
      return false
    }
    return true
  }

  login(){
    if(!this.checkCreds())
      return
    
    this.afAuth.auth.signInWithEmailAndPassword(this.email.value, this.password.value).then(response => {
      if(response && response.email)
        this.router.navigate(['/'])
    }).catch(error => {
      this.snack(error.message)
    })
  }

  register(){
    if(!this.checkCreds())
      return
    this.afAuth.auth.createUserWithEmailAndPassword(this.email.value, this.password.value).then(response => {
      if(response && response.email)
        this.router.navigate(['/'])
    }, error => {
      this.snack(error.message)
    })
  }

  forgotPassword(){
    if(!this.email.valid)
      return this.snackBar.open("Please type in your email address", null, {duration: 4000, panelClass: "danger"})
      this.afAuth.auth.sendPasswordResetEmail(this.email.value).then(response => {
        this.snackBar.open("Password reset email sent - it can take up to an hour to arrive", null, {duration: 5000})
      }, error => {
        return this.snackBar.open("Something went wrong: " + error, null, {duration: 10000, panelClass: "danger"})
    })
  }

  private snack(message: string){
    this.snackBar.open(message, null, {
      panelClass: "danger",
      duration: 3000
    })
  }
}
