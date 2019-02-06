/*

    # Vulcan.exportPostDetails({ selector, outputDir })

      Script to export a list of post details to a CSV file.

      selector (Object, optional):
        Mongo selector to choose posts. Default is all published pending and approved posts
      outputDir (String, required):
        Absolute path to the directory where you'd like the CSV output to be written
      outputFile (String, optional):
        Filename for your CSV file. Defaults to 'post_details'

    # Vulcan.exportPostDetailsByMonth({ month, outputDir, outputFile })

      Export details for a whole month

      month: (String, optional)
        Month to export posts for in


*/

import { wrapVulcanAsyncScript } from './utils'
import { Posts } from '../../lib/collections/posts'
import Users from 'meteor/vulcan:users'
import fs from 'mz/fs'
import path from 'path'
import moment from 'moment'
import Papa from 'papaparse'

const getPosts = (selector) => {
  const defaultSelector = {
    baseScore: {$gte: 0},
    draft: {$ne: true},
    status: { $in: [1, 2] }
  }

  const fields = {
    id: 1,
    userId: 1,
    title: 1,
    slug: 1,
    baseScore: 1,
    meta: 1,
    frontpageDate: 1,
    postedAt: 1,
    createdAt: 1
  }

  const finalSelector = Object.assign({}, defaultSelector, selector || {})

  return Posts
    .find(finalSelector, {fields, sort: { createdAt: 1 }})
}

Vulcan.exportPostDetails = wrapVulcanAsyncScript(
  'exportPostDetails',
  async ({selector, outputDir, outputFile = 'post_details.csv'}) => {
    if (!outputDir) throw new Error(`you must specify an output directory (hint: {outputDir})`)
    const documents = getPosts(selector)
    let c = 0
    const count = documents.count()
    const rows = []
    for (let post of documents) {
      // SD: this makes things horribly slow, but no idea how to do a more efficient join query in Mongo
      const user = Users.findOne(post.userId, { fields: { username: 1, email: 1 }})
      const row = {
        username: user.username,
        email: user.email,
        id: post._id,
        user_id: post.userId,
        title: post.title,
        slug: post.slug,
        karma: post.baseScore,
        community: !!post.meta,
        frontpage_date: post.frontpageDate,
        posted_at: post.postedAt,
        created_at: post.createdAt,
        url: `https://forum.effectivealtruism.org/posts/${post._id}/${post.slug}`
      }
      rows.push(row)
      c++
      if (c % 20 === 0) console.log(`Post Details: Processed ${c}/${count} posts (${Math.round(c / count * 100)}%)`)
    }
    const csvFile = Papa.unparse(rows)
    const filePath = path.join(outputDir,`${path.basename(outputFile)}.csv`)
    await fs.writeFile(filePath, csvFile)
    console.log(`Wrote details for ${rows.length} posts to ${filePath}`)
  })

Vulcan.exportPostDetailsByMonth = ({month, outputDir, outputFile}) => {
  const lastMonth = moment.utc(month, 'YYYY-MM').startOf('month')
  outputFile = outputFile || `post_details_${lastMonth.format('YYYY-MM')}`
  console.log(`Exporting all posts from ${lastMonth.format('MMM YYYY')}`)
  return Vulcan.exportPostDetails({
  selector: {
    createdAt: {
      $gte: lastMonth.toDate(), // first of prev month
      $lte: moment.utc(lastMonth).endOf('month').toDate()
    }
  },
  outputFile,
  outputDir
  })
}
