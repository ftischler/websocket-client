import { NgZone } from '@angular/core';
import { asyncScheduler, SchedulerLike, Subscription } from 'rxjs';

class LeaveZoneScheduler implements SchedulerLike {
  constructor(private ngZone: NgZone, private scheduler: SchedulerLike) { }

  schedule(...args: any[]): Subscription {
    return this.ngZone.runOutsideAngular(() => {
      return this.scheduler.schedule.apply(this.scheduler, args);
    });
  }

  now(): number {
    return 0;
  }
}

class EnterZoneScheduler implements SchedulerLike {
  constructor(private zone: NgZone, private scheduler: SchedulerLike) { }

  schedule(...args: any[]): Subscription {
    return this.zone.run(() => {
      return this.scheduler.schedule.apply(this.scheduler, args);
    });
  }

  now(): number {
    return 0;
  }
}

export function leaveZone(zone: NgZone, scheduler: SchedulerLike = asyncScheduler) {
  return new LeaveZoneScheduler(zone, scheduler);
}

export function enterZone(zone: NgZone, scheduler: SchedulerLike = asyncScheduler) {
  return new EnterZoneScheduler(zone, scheduler);
}
