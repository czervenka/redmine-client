import { Component, OnInit, Input } from '@angular/core';

import * as moment from 'moment';

import { MessageService } from '../message.service';
import { RedmineService } from '../redmine.service';
import { SettingsService } from '../settings.service';

import { DayLog, Week } from '../models/time-entries';

@Component({
  selector: 'app-week-log',
  templateUrl: './week-log.component.html',
  styleUrls: ['./week-log.component.css']
})
export class WeekLogComponent implements OnInit {

  weekHtml5fmt: string = `${moment().year()}-W${moment().isoWeek() < 10 ? '0' : ''}${moment().isoWeek()}`; // formatting moment using HTML5_FMT has issues; use only when setting a date
  weeks = [];

  dayLogs: DayLog[];

  dailyWorkingHours: number;

  constructor(
    private messageService: MessageService,
    private redmine: RedmineService,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    this.initWeeks();
    this.dailyWorkingHours = this.settings.get().dailyWorkingHours;
    this.listWorkingDayLogsForWeek();
  }

  private initWeeks() {
    let weekNumber = moment().week();
    let year = moment().year();
    for(let i = 0; i < 8; i++, weekNumber--) {
      if(weekNumber < 1) {
        weekNumber = 52;
        year--;
      }
      const min = moment().week(weekNumber).year(year).startOf("week").format("YYYY-MM-DD");
      const max = moment().week(weekNumber).year(year).endOf("week").subtract(2, 'days').format("YYYY-MM-DD");
      this.weeks.push({
       html5fmt: `${year}-W${weekNumber < 10 ? '0' : ''}${weekNumber}`,
       period: `${weekNumber}. week: ${min} - ${max}`
      });
    }
  }

  listWorkingDayLogsForWeek() {
    this.redmine.listDayLogs(this.weekHtml5fmt, 'week', true, true, false).subscribe(dayLogs => {
      // debugger;
      this.dayLogs = dayLogs;
    });
  }

  setWeek(week: string) {
    // debugger;
    this.weekHtml5fmt = week;
    this.listWorkingDayLogsForWeek();
  }

}
