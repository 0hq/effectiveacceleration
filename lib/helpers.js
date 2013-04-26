getSetting = function(setting, defaultValue){
  var settings=Settings.find().fetch()[0];
  if(settings){
    return settings[setting];
  }
  return typeof defaultValue === 'undefined' ? '' : defaultValue;
}
clearSeenErrors = function(){
  Errors.update({seen:true}, {$set: {show:false}}, {multi:true});
}
t=function(message){
  var d=new Date();
  console.log("### "+message+" rendered at "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds());
}
nl2br= function(str) {   
var breakTag = '<br />';    
return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}
getSetting = function(setting, defaultSetting){
  var settingsObject=Settings.find().fetch()[0];
  return (settingsObject && settingsObject[setting]) ? settingsObject[setting] : defaultSetting;
}
getAuthorName = function(item){
  // keep both variables for transition period
  var id=item.userId || item.user_id;
  // if item is linked to a user, get that user's display name. Else, return the author field.
  return (id && (user=Meteor.users.findOne(id))) ? getDisplayName(user) : this.author;
}
scrollPageTo = function(selector){
  $('body').scrollTop($(selector).offset().top);  
}
getDigestURL = function(moment){
  return '/digest/'+moment.year()+'/'+(moment.month()+1)+'/'+moment.date()
}
getDateRange= function(pageNumber){
  var now = moment(new Date());
  var dayToDisplay=now.subtract('days', pageNumber-1);
  var range={};
  range.start = dayToDisplay.startOf('day').valueOf();
  range.end = dayToDisplay.endOf('day').valueOf();
  // console.log("after: ", dayToDisplay.startOf('day').format("dddd, MMMM Do YYYY, h:mm:ss a"));
  // console.log("before: ", dayToDisplay.endOf('day').format("dddd, MMMM Do YYYY, h:mm:ss a"));
  return range;
}
// getPostCategories = function(post){
//   var postCategories = _.map(post.categories, function(categoryId){
//     return Categories.findOne(categoryId);
//   });
//   // put resulting array through a filter to remove empty values in case
//   // some of the post's categories weren't found in the database
//   return _.filter(postCategories, function(e){return e});
// }
getDomain = function(url){
    urlObject = Npm.require('url');
    return urlObject.parse(url).hostname;
}
// ---------------------------------- URL Helper Functions ----------------------------------- //
getPostUrl = function(id){
  return Meteor.absoluteUrl()+'posts/'+id;
}
getCommentUrl = function(id){
  return Meteor.absoluteUrl()+'comments/'+id;
}
getPostCommentUrl = function(postId, commentId){
  // get link to a comment on a post page
  return Meteor.absoluteUrl()+'posts/'+postId+'/comment/'+commentId;
}
getUserUrl = function(id){
  return Meteor.absoluteUrl()+'users/'+id;
}
getCategoryUrl = function(slug){
  return Meteor.absoluteUrl()+'c/'+slug;
}
slugify = function(text) {
  text = text.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
  text = text.replace(/-/gi, "_");
  text = text.replace(/\s/gi, "-");
  text = text.toLowerCase();
  return text;
}
// ---------------------------------- String Helper Functions ----------------------------------- //
cleanUp = function(s){
  return stripHTML(s);
}
stripHTML = function(s){
  return s.replace(/<(?:.|\n)*?>/gm, '');
}
stripMarkdown = function(s){
  var converter = new Markdown.Converter();
  var html_body = converter.makeHtml(s);
  return stripHTML(html_body);
}
trimWords = function(s, numWords) {
  expString = s.split(/\s+/,numWords);
  if(expString.length >= numWords)
    return expString.join(" ")+"…";
  return s;
}