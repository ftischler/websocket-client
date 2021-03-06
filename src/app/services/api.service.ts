import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VoteData } from '../model/vote-data';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private httpClient: HttpClient) { }

  public getData(err = false): Observable<VoteData[]> {
    return this.httpClient.get<VoteData[]>(err ? '/lel' : '/api/test');
  }
}
