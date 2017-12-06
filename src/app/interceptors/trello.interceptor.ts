import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse }
  from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { TrelloService } from 'app/services/trello.service';

/**
 * Http request interceptor to catch trello login errors and restart the auth workflow
 */
@Injectable()
export class TrelloInterceptor implements HttpInterceptor {

  constructor(
    private $injector: Injector
  ){}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if(new URL(req.url).hostname == "api.trello.com"){
      return next.handle(req).do(evt => {}, err => {
        if (err instanceof HttpErrorResponse && (err.status == 401 || err.status == 403)) {
          let trello = this.$injector.get(TrelloService)
          trello.removeTrelloToken()
          trello.goToLoginPage()
        }
      });
    } else 
      return next.handle(req)

  }
}
