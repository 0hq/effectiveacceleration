Later = Npm.require('later');

defaultFrequency = 7; // once a week

getSchedule = function (parser) {
  var frequency = getSetting('newsletterFrequency', defaultFrequency);
  switch (frequency) {
    case 1: // every day
    // sched = {schedules: [{dw: [1,2,3,4,5,6,0]}]};
    return parser.recur().on(1,2,3,4,5,6,0).dayOfWeek();

    case 2: // Mondays, Wednesdays, Fridays
    // sched = {schedules: [{dw: [2,4,6]}]};
    return parser.recur().on(2,4,6).dayOfWeek();

    case 3: // Mondays, Thursdays
    // sched = {schedules: [{dw: [2,5]}]};
    return parser.recur().on(2,5).dayOfWeek();

    case 7: // Once a week (Mondays)
    // sched = {schedules: [{dw: [2]}]};
    return parser.recur().on(2).dayOfWeek();

    default: // Once a week (Mondays)
    return parser.recur().on(2).dayOfWeek();
  }  
}

Meteor.methods({
  getNextJob: function () {
    var nextJob = SyncedCron.nextScheduledAtDate('scheduleNewsletter');
    console.log(nextJob);
    return nextJob;
  }
});

resetNewsletterJob = function () {
  SyncedCron.stop();
  addJob();
}

var addJob = function () {
  SyncedCron.add({
    name: 'scheduleNewsletter',
    schedule: function(parser) {
      // parser is a later.parse object
      // var sched;
      return getSchedule(parser)
    }, 
    job: function() {
      scheduleNextCampaign();
    }
  });
}
Meteor.startup(function () {
  if (getSetting('enableNewsletter', false)) {
    addJob();
  }
});