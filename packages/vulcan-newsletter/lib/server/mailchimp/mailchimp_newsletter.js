/* eslint-disable no-console */

// newsletter scheduling with MailChimp

import Posts from 'meteor/vulcan:posts';
import VulcanEmail from 'meteor/vulcan:email';
import htmlToText from 'html-to-text';
import moment from 'moment';
import Newsletter from '../../namespace.js';
import MailChimp from './mailchimp_api.js';
import { Utils, getSetting } from 'meteor/vulcan:core';

const defaultPosts = 5;

Newsletter.scheduleNextWithMailChimp = function (isTest = false) {
  var posts = Newsletter.getPosts(getSetting('postsPerNewsletter', defaultPosts));
  if(!!posts.length){
    return Newsletter.scheduleWithMailChimp(Newsletter.build(posts), isTest);
  }else{
    var result = {result: 'No posts to schedule today…'};
    return result;
  }
};

Newsletter.scheduleWithMailChimp = function (campaign, isTest = false) {

  var apiKey = getSetting('mailChimpAPIKey');
  var listId = getSetting('mailChimpListId');

  if(!!apiKey && !!listId){

    var wordCount = 15;
    var subject = campaign.subject;
    while (subject.length >= 150){
      subject = Utils.trimWords(subject, wordCount);
      wordCount--;
    }

    try {

      var api = new MailChimp(apiKey);
      var text = htmlToText.fromString(campaign.html, {wordwrap: 130});
      var defaultEmail = getSetting('defaultEmail');
      var campaignOptions = {
        type: 'regular',
        options: {
          list_id: listId,
          subject: subject,
          from_email: defaultEmail,
          from_name: getSetting('title')
        },
        content: {
          html: campaign.html,
          text: text
        }
      };

      console.log('// Creating campaign…');
      console.log('// Subject: '+subject)
      // create campaign
      var mailchimpNewsletter = api.call( 'campaigns', 'create', campaignOptions);

      console.log('// Newsletter created');
      // console.log(campaign)

      var scheduledTime = moment().utcOffset(0).add(1, 'hours').format("YYYY-MM-DD HH:mm:ss");

      var scheduleOptions = {
        cid: mailchimpNewsletter.id,
        schedule_time: scheduledTime
      };

      // schedule campaign
      var schedule = api.call('campaigns', 'schedule', scheduleOptions); // eslint-disable-line

      console.log('// Newsletter scheduled for '+scheduledTime);
      // console.log(schedule)

      // if this is not a test, mark posts as sent
      if (!isTest)
        var updated = Posts.update({_id: {$in: campaign.postIds}}, {$set: {scheduledAt: new Date()}}, {multi: true}) // eslint-disable-line

      // send confirmation email
      var confirmationHtml = VulcanEmail.getTemplate('newsletterConfirmation')({
        time: scheduledTime,
        newsletterLink: mailchimpNewsletter.archive_url,
        subject: subject
      });
      VulcanEmail.send(defaultEmail, 'Newsletter scheduled', VulcanEmail.buildTemplate(confirmationHtml));

    } catch (error) {
      console.log(error);
    }
    return subject;
  }
};
