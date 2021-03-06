import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { RedmineService } from '../redmine.service';
import { SettingsService } from '../settings.service';

import { Field } from '../models/fields';
import { Issue, IssueList } from '../models/issues';
import { NewTimeEntry, TimeEntry } from '../models/time-entries';

@Component({
  selector: 'app-daily-time-entry',
  templateUrl: './daily-time-entry.component.html',
  styleUrls: ['./daily-time-entry.component.css']
})
export class DailyTimeEntryComponent implements OnInit {

  @Input() day: string;
  @Input() hoursToBeLogged: number;
  @Output() newEntryEmitter = new EventEmitter<TimeEntry>();

  public commentMaxLength = 255;
  public timeEntryForm: FormGroup;
  public issues = [];
  public activities: Field[] = [];

  constructor(
    private redmine: RedmineService,
    private settings: SettingsService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.initTimeEntryForm();
  }

  initTimeEntryForm() {
    // debugger;
    const defaultHours = (this.hoursToBeLogged > 0) ? this.hoursToBeLogged : this.settings.get().defaultHours;
    const defaultIssueId = this.settings.get().defaultIssueId;
    this.timeEntryForm = this.formBuilder.group ({
      issueId: [(defaultIssueId !== undefined && defaultIssueId != null) ? defaultIssueId : null, Validators.required],
      hours: [defaultHours, [Validators.required, Validators.min(0.25), Validators.max(24)]],
      activityId: [null, Validators.required],
      comment: ['', Validators.maxLength(this.commentMaxLength)]
    });
    this.redmine.getActivitiesEnum().subscribe((activities: Field[]) => {
      this.activities = activities;
      // debugger;
      this.redmine.getDefaultActivity().subscribe((defaultActivity: Field) => {
        // debugger;
        this.timeEntryForm.patchValue({activityId: defaultActivity.id});
        this.redmine.listMyIssues().subscribe(issueList => {
          this.issues = issueList.issues;
        });
      });
    });
  }

  createNewTimeEntry() {
    // debugger;
    const activityId = (typeof this.timeEntryForm.value.activityId == "string") ? parseInt(this.timeEntryForm.value.activityId, 10) : this.timeEntryForm.value.activityId;
    const activityName = this.redmine.getActivityById(activityId).name;
    const newTimeEntry = {
      issue_id: this.timeEntryForm.value.issueId,
      spent_on: this.day,
      hours: this.timeEntryForm.value.hours,
      activity_id: activityId,
      activity_name: activityName,
      comments: this.timeEntryForm.value.comment
    };
    this.redmine.createNewTimeEntry(newTimeEntry).subscribe(created => {
      this.hoursToBeLogged -= created.hours;
      this.initTimeEntryForm()
      this.newEntryEmitter.emit(created);
    });
  }

}
