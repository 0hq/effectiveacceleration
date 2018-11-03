import { getSetting } from 'meteor/vulcan:core'
import { Picker } from 'meteor/meteorhacks:picker'
import { Posts } from '../../lib/collections/posts'
import { Comments } from '../../lib/collections/comments'
import Users from 'meteor/vulcan:users';

// Some legacy routes have an optional subreddit prefix, which is either
// omitted, is /r/all, /r/discussion, or /r/lesswrong. The is followed by
// /lw/postid possibly followed by a slug, comment ID, filter settings, or other
// things, some of which is supported and some of which isn't.
//
// If a route has this optional prefix, use `subredditPrefixRoute` to represent
// that part. It contains two optional parameters, constrained to be `r` and
// a subreddit name, respectively (the subreddits being lesswrong, discussion,
// and all). Since old-LW made all post IDs non-overlapping, we just ignore
// which subreddit was specified.
//
// (In old LW, the set of possible subreddits may also have included user
// account names, for things in users' draft folders. We don't support getting
// old drafts via legacy routes; I'm not sure whether we support getting them
// through other UI).
const subredditPrefixRoute = "/:section(r)?/:subreddit(all|discussion|lesswrong)?";

// Because the EA Forum was identical except for the change from /lw/ to /ea/
const legacyRouteAcronym = getSetting('legacyRouteAcronym', 'lw')

function findPostByLegacyId(legacyId) {
  const parsedId = parseInt(legacyId, 36);
  return Posts.findOne({"legacyId": parsedId.toString()});
}

function findCommentByLegacyId(legacyId) {
  const parsedId = parseInt(legacyId, 36);
  return Comments.findOne({"legacyId": parsedId.toString()});
}

function makeRedirect(res, destination) {
  res.writeHead(301, {"Location": destination});
  res.end();
}

function findPostByLegacyAFId(legacyId) {
  return Posts.findOne({"agentFoundationsId": legacyId})
}

function findCommentByLegacyAFId(legacyId) {
  return Comments.findOne({"agentFoundationsId": legacyId})
}


//Route for redirecting LessWrong legacy posts
// addRoute({ name: 'lessWrongLegacy', path: 'lw/:id/:slug/:commentId', componentName: 'LegacyPostRedirect'});

// Route for old post links
Picker.route(subredditPrefixRoute+`/${legacyRouteAcronym}/:id/:slug?`, (params, req, res, next) => {
  if(params.id){

    try {
      const post = findPostByLegacyId(params.id);
      if (post) {
        return makeRedirect(res, Posts.getPageUrl(post));
      } else {
        // don't redirect if we can't find a post for that link
        //eslint-disable-next-line no-console
        console.log('// Missing legacy post', params);
        res.statusCode = 404
        res.end(`No legacy post found with: id=${params.id} slug=${params.slug}`);
      }
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error('// Legacy Post error', error, params)
      res.statusCode = 404
      res.end(`No legacy post found with: id=${params.id} slug=${params.slug}`);
    }
  } else {
    res.statusCode = 404
    res.end("Please provide a URL");
  }
});

// Route for old comment links
Picker.route(subredditPrefixRoute+`/${legacyRouteAcronym}/:id/:slug/:commentId`, (params, req, res, next) => {
  if(params.id){

    try {
      const post = findPostByLegacyId(params.id);
      const comment = findCommentByLegacyId(params.commentId);
      if (post && comment) {
        return makeRedirect(res, Comments.getPageUrl(comment));
      } else if (post) {
        return makeRedirect(res, Posts.getPageUrl(post));
      } else {
        // don't redirect if we can't find a post for that link
        res.statusCode = 404
        res.end(`No legacy post found with: id=${params.id} slug=${params.slug}`);
      }
    } catch (error) {
      //eslint-disable-next-line no-console
      console.log('// Legacy comment error', error, params)
      res.statusCode = 404
      res.end(`No legacy post found with: id=${params.id} slug=${params.slug}`);
    }
  } else {
    res.statusCode = 404
    res.end(`No legacy post found with: id=${params.id} slug=${params.slug}`);
  }
});

// Route for old user links
Picker.route('/user/:slug/:category?/:filter?', (params, req, res, next) => {
  res.statusCode = 404
  if(params.slug){
    try {
      const user = Users.findOne({$or: [{slug: params.slug}, {username: params.slug}]});
      if (user) {
        return makeRedirect(res, Users.getProfileUrl(user));
      } else {
        //eslint-disable-next-line no-console
        console.log('// Missing legacy user', params);
        res.statusCode = 404
        res.end(`No legacy user found with: ${params.slug}`);
      }
    } catch (error) {
      //eslint-disable-next-line no-console
      console.log('// Legacy User error', error, params);
      res.statusCode = 404
      res.end(`No legacy user found with: ${params.slug}`);
    }
  } else {
    res.statusCode = 404
    res.end(`No legacy user found with: ${params.slug}`);
  }
});

// Route for old comment links

Picker.route('/posts/:_id/:slug/:commentId', (params, req, res, next) => {
  if(params.commentId){
    try {
      const comment = Comments.findOne({_id: params.commentId});
      if (comment) {
        return makeRedirect(res, Comments.getPageUrl(comment));
      } else {
        // don't redirect if we can't find a post for that link
        //eslint-disable-next-line no-console
        console.log('// Missing legacy comment', params);
        res.statusCode = 404
        res.end(`No comment found with: ${params.commentId}`);
      }
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error('// Legacy Comment error', error, params)
      res.statusCode = 404
      res.end(`No comment found with: ${params.commentId}`);
    }
  } else {
    res.statusCode = 404
    res.end("Please provide a URL");
  }
});

// Route for old images

Picker.route('/static/imported/:year/:month/:day/:imageName', (params, req, res, next) => {
  if(params.imageName){
    try {
      return makeRedirect(res,
        `https://raw.githubusercontent.com/tricycle/lesswrong/master/r2/r2/public/static/imported/${params.year}/${params.month}/${params.day}/${params.imageName}`);
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error('// Legacy Comment error', error, params)
      res.statusCode = 404;
      res.end("Invalid image url")
    }
  } else {
    res.statusCode = 404;
    res.end("Please provide a URL")
  }
});


// Legacy RSS Routes

// Route for old comment rss feeds
Picker.route(subredditPrefixRoute+`/${legacyRouteAcronym}/:id/:slug/:commentId/.rss`, (params, req, res, next) => {
  if(params.id){
    try {
      const post = findPostByLegacyId(params.id);
      const comment = findCommentByLegacyId(params.commentId);
      if (post && comment) {
        return makeRedirect(res, Comments.getRSSUrl(comment));
      } else if (post) {
        return makeRedirect(res, Posts.getPageUrl(post));
      } else {
        // don't redirect if we can't find a post for that link
        res.statusCode = 404
        res.end(`No legacy post found with: id=${params.id} slug=${params.slug}`);
      }
    } catch (error) {
      //eslint-disable-next-line no-console
      console.log('// Legacy comment error', error, params)
      res.statusCode = 404
      res.end(`No legacy post found with: id=${params.id} slug=${params.slug}`);
    }
  } else {
    res.statusCode = 404
    res.end(`No legacy post found with: id=${params.id} slug=${params.slug}`);
  }
});

// Route for old general RSS (all posts)
Picker.route('/.rss', (params, req, res, next) => {
  return makeRedirect(res, "/feed.xml");
});

// Route for old general RSS (all comments)
Picker.route('comments/.rss', (params, req, res, next) => {
  return makeRedirect(res, '/feed.xml?type=comments');
});

Picker.route('/rss/comments.xml', (params, req, res, next) => {
  return makeRedirect(res, '/feed.xml?type=comments');
});

// Route for old general RSS (all posts)
Picker.route('/:section?/:subreddit?/:new?/.rss', (params, req, res, next) => {
  return makeRedirect(res, '/feed.xml');
});

// Route for old promoted RSS (promoted posts)
Picker.route('/promoted/.rss', (params, req, res, next) => {
  return makeRedirect(res, '/feed.xml?view=curated-rss');
});


// Route for old agent-foundations post and commentlinks
Picker.route('/item', (params, req, res, next) => {
  if(params.query.id){
    const id = parseInt(params.query.id)
    try {
      const post = findPostByLegacyAFId(id);

      if (post) {
        return makeRedirect(res, Posts.getPageUrl(post));
      } else {
        const comment = findCommentByLegacyAFId(id);
        if (comment) {
          return makeRedirect(res, Comments.getPageUrl(comment))
        } else {
          // don't redirect if we can't find a post for that link
          //eslint-disable-next-line no-console
          console.log('// Missing legacy af item', params);
          res.statusCode = 404
          res.end(`No af legacy item found with: id=${params.query.id}`);
        }

      }
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error('// Legacy item error', error, params)
      res.statusCode = 404
      res.end(`No legacy item found with: params=${params}`);
    }
  } else {
    res.statusCode = 404
    res.end("Please provide a URL");
  }
});
