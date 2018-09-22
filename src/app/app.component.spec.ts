import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { merge, Observable, of, Subject } from 'rxjs';
import { catchError, mapTo, publishReplay, refCount, takeWhile, tap } from 'rxjs/operators';

export interface ResultPoll {
  pollId: string;
  name: string;
  pollOptions: string[];
  results: ResultEntry[];
  counter: number;
  isSecret: boolean;
}

export interface ResultEntry {
  choice: number;
  value: number;
  option?: string;
}

const testResultPoll: ResultPoll = {
  pollId: '1',
  name: 'test',
  pollOptions: ['option1', 'option2'],
  results: [],
  counter: 1,
  isSecret: false
};

xdescribe('AppComponent', () => {
  let consumer: NemoRxConsumer;

  beforeEach(() => {
    consumer = new NemoRxConsumer();
  });

  it('should show results', () => {
    consumer.pollService.nextPollLiveResults(testResultPoll);
    consumer.results$.subscribe(r => {
      expect(r).toEqual(testResultPoll);
    });
  });
});

class NemoRxProducer {
  public alive = true;
  public isLoading = true;

  public result = {
    emit: jasmine.createSpy('emitResults')
  };

  private pollService = new PollService();

  constructor() { }

  getPollResults(): Observable<ResultPoll | null> {
    return merge<any>(
      this.pollService.getPollResults().pipe(
        catchError(() => {
          this.finishLoading();
          return of(null);
        })
      ),
      this.pollService.getResultsFromNewPoll(),
      this.pollService.detectClosedPoll().pipe(mapTo(null)),
      this.pollService.getPollLiveResults()
    ).pipe(
      tap(poll => {
        this.finishLoading();
        this.result.emit(poll);
      }),
      publishReplay(1),
      refCount(),
      takeWhile(() => this.alive)
    );
  }

  public finishLoading(): void {
    this.isLoading = false;
  }
}

class NemoRxConsumer {
  public pollService = new PollService();
  public producer = new NemoRxProducer();
  public results$ = this.producer.getPollResults();
}

class PollService {
  private pollResults$ = new Subject<ResultPoll>();
  private resultsFromNewPoll$ = new Subject<ResultPoll>();
  private closedPoll$ = new Subject<string>();
  private pollLiveResults$ = new Subject<ResultPoll>();

  public getPollResults() {
    return this.pollResults$.asObservable();
  }
  public getResultsFromNewPoll() {
    return this.resultsFromNewPoll$.asObservable();
  }
  public detectClosedPoll() {
    return this.closedPoll$.asObservable();
  }
  public getPollLiveResults() {
    return this.pollLiveResults$.asObservable();
  }

  public nextPollResults(next: ResultPoll) {
    this.pollResults$.next(next);
  }
  public errorPollResults(err: any = 'FEHLER') {
    this.pollResults$.error(err);
  }
  public nextResultsFromNewPoll(next: ResultPoll) {
    this.resultsFromNewPoll$.next(next);
  }
  public errorResultsFromNewPoll(err: any = 'FEHLER') {
    this.resultsFromNewPoll$.error(err);
  }
  public nextClosedPoll(next: string = 'CLOSED') {
    this.closedPoll$.next(next);
  }
  public errorClosedPoll(err: any = 'FEHLER') {
    this.closedPoll$.error(err);
  }
  public nextPollLiveResults(next: ResultPoll) {
    this.pollLiveResults$.next(next);
  }
  public errorPollLiveResults(err: any = 'FEHLER') {
    this.closedPoll$.error(err);
  }
}
