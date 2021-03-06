import { Component, OnInit } from '@angular/core';

import { SettingsService } from '../settings.service';
import { RedmineService } from '../redmine.service';
import { MessageService } from '../message.service';
import { Field } from '../models/fields';
import { IssueList, Issue } from '../models/issues';
import { Settings } from '../models/settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  settings: Settings;
  public activities: Field[] = [];
  public issues: Issue[] = [];

  constructor(
    private settingsService: SettingsService,
    private redmine: RedmineService,
    private message: MessageService
  ) { }

  ngOnInit() {
    this.settings = this.settingsService.get();
    this.redmine.getActivitiesEnum().subscribe((activities: Field[]) => {
      this.activities = activities;
      this.redmine.listMyIssues(true).subscribe(issueList => this.issues = issueList.issues);
      // // debugger;
      // this.redmine.getDefaultActivity().subscribe((defaultActivity: Field) => {
      //   // debugger;
      //   this.timeEntryForm.patchValue({activityId: defaultActivity.id});
      // });
    });
  }

  save() {
    console.log('Save settings ' + JSON.stringify(this.settings));
    this.settingsService.save(this.settings);
    this.message.add('Settings saved.');
  }

  reset() {
    // debugger;
    this.settings = this.settingsService.reset();
    console.log('Settings reset to ' + JSON.stringify(this.settings))
  }

}
