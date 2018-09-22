import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';
import { SocketService } from './services/socket.service';
import { MatSnackBar } from '@angular/material';
import { merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { VoteData } from './model/vote-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<boolean>();

  constructor(private apiService: ApiService, private socketService: SocketService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    merge(
      this.apiService.getData(),
      this.socketService.stream('data')
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe((voteData: VoteData) => {
      this.showSnackBar(`Received data - User: ${voteData.user} Voted: ${voteData.voted}`);
    }, err => this.showSnackBar(err.message),
      () => this.showSnackBar('GetData completed')
    );

    this.socketService.onConnectError().pipe(
      takeUntil(this.destroy$)
    ).subscribe(err => this.snackBar.open(`Connect error ${err.message}`),
      err => this.showSnackBar(`Connect error ${err}`),
      () => this.showSnackBar('ConnectError completed')
    );

    this.socketService.onReconnect().pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.snackBar.open('Reconnected'),
      err => this.showSnackBar(`Reconnect error ${err}`),
      () => this.showSnackBar('Reconnected completed')
    );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

  private showSnackBar(message: string): void {
    this.snackBar.dismiss();
    this.snackBar.open(message);
  }
}
