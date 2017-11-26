import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'app/services/electron.service';
import { AfkService } from 'app/services/afk.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  constructor(
    private electronService: ElectronService,
    private afkService: AfkService
  ) {

    if(!electronService.ipcRenderer || !electronService.childProcess){
      throw new Error("Couldn't find electron renderer or child process!")
    }
  }

  ngOnInit(){
  }
  
}
