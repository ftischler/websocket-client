import { SocketService } from './socket.service';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import Socket = SocketIOClient.Socket;
import { Subject } from 'rxjs';
import Emitter = SocketIOClient.Emitter;
import { filter, map } from 'rxjs/operators';

class MockSocket implements Partial<Socket> {
  private socketSubject = new Subject<{type: string, payload: any}>();

  public off = jasmine.createSpy('socket.off');
  public emit = jasmine.createSpy('socket.emit');

  public on(event: string, fn: Function): Emitter {
    this.socketSubject.pipe(
      filter(e => e.type === event),
      map(e => e.payload)
    ).subscribe(v => fn(v));

    return null;
  }

  public sendMessage<T>(type: string, payload: T): void {
    this.socketSubject.next({type, payload});
  }

  public sendError<T>(error: T): void {
    this.socketSubject.error(error);
  }

  public complete(): void {
    this.socketSubject.complete();
  }
}

const mockSocket = new MockSocket();

fdescribe('SocketService', () => {
  let socketService: SocketService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SocketService,
        {provide: 'io', useValue: () => mockSocket}
      ]
    });
    socketService = TestBed.get(SocketService);
  });

  it('should create', () => {
    expect(socketService).toBeTruthy();
  });

  it('should emit four times', fakeAsync(() => {
    const subscribeSpy = jasmine.createSpy('subscribeSpy');
    socketService.stream('test').subscribe(subscribeSpy);
    mockSocket.sendMessage('test', 'HALLO');
    mockSocket.sendMessage('test', 'HALLO1');
    mockSocket.sendMessage('test', 'HALLO2');
    mockSocket.sendMessage('test', 'HALLO3');
    tick();
    expect(subscribeSpy).toHaveBeenCalledTimes(4);
  }));

  it('should also emit four times even tough an error happened', fakeAsync(() => {
    const subscribeSpy = jasmine.createSpy('subscribeSpy');
    socketService.stream('test').subscribe(subscribeSpy);
    mockSocket.sendMessage('test', 'HALLO');
    mockSocket.sendError('FEHLER');
    mockSocket.sendMessage('test', 'HALLO1');
    mockSocket.sendMessage('test', 'HALLO2');
    mockSocket.sendMessage('test', 'HALLO3');
    tick();
    expect(subscribeSpy).toHaveBeenCalledTimes(4);
  }));

  xit('should replay the last event', fakeAsync(() => {
    const subscribeSpy = jasmine.createSpy('subscribeSpy');
    mockSocket.sendMessage('test', 'HALLO');
    tick();
    socketService.stream('test').subscribe(subscribeSpy);
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
  }));
});
