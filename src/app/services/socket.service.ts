import { Injectable, NgZone } from '@angular/core';
import { EMPTY, fromEventPattern, Observable, of } from 'rxjs';
import { catchError, concatMap, observeOn, switchMap, tap } from 'rxjs/operators';
import { enterZone } from '../zone/zone-scheduler';
import * as io from 'socket.io-client';
import Socket = SocketIOClient.Socket;
import { SOCKET_CONFIG } from '../config/socket.config';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socketOptions: any;
  public socket: Socket;

  constructor(private ngZone: NgZone) {
    this.createSocket();
  }

  public createSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socketOptions = {...SOCKET_CONFIG};

    this.socket = io('/', this.socketOptions);
  }

  public sendMessage(channel: string, message: any): any {
    if (!this.socket) {
      return false;
    }
    return this.socket.emit(`${channel}`, message);
  }

  public stream<T = any>(eventName: string): Observable<T> {
    return fromEventPattern<T>(handler => {
      return this.socket.on(eventName, handler);
    }, () => this.socket.off(eventName)).pipe(
      observeOn(enterZone(this.ngZone)),
      switchMap(v => of(v).pipe(
        catchError(() => EMPTY)
      ))
    );
  }

  public onReconnect(): Observable<number> {
    return this.stream<number>('reconnect');
  }

  public onConnectError(): Observable<Error> {
    return this.stream<Error>('connect_error');
  }
}
