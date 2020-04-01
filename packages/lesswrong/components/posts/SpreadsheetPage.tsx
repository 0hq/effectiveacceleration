import React from 'react';
import { registerComponent, Components, Utils } from '../../lib/vulcan-lib';
// import { AnalyticsContext } from "../../lib/analyticsEvents";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import StarIcon from '@material-ui/icons/Star';
import { commentBodyStyles } from '../../themes/stylePiping'
import * as _ from 'underscore';
import classNames from 'classnames';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { QueryLink, Link } from '../../lib/reactRouterWrapper'
import { useLocation } from '../../lib/routeUtil';
import qs from 'qs'

const cellStyle = () => ({
  maxWidth: 350,
  wordBreak: "break-word"
})

const headerStyle = theme => ({
  fontSize: "1.1rem",
  fontWeight: 600,
  backgroundColor: theme.palette.grey[800],
  borderRight: `1px solid white`,
  color: "white",
  wordBreak: "normal",
  position: "sticky",
  top: 0,
  paddingTop: 0,
  paddingBottom: 0,
  zIndex: 1,
})

const styles = theme => ({
  root: {
    marginBottom: -150, // adjusting for footer
    position: "relative",
  },
  intro: {
    maxWidth: 564,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 300
    }
  },
  introWrapper: {
    display: "flex",
    ...commentBodyStyles(theme),
    justifyContent: "space-around",
    alignItems: "center",
    maxWidth: 880,
    padding: 50,
    paddingTop: 0,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
      paddingBottom: 0,
    },
    [theme.breakpoints.down('xs')]: {
      minWidth: 'initial',
      display: "block",
      padding: 16
    },
  },
  submitButton: {
    marginLeft: 50,
    padding: 16,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: theme.palette.primary.dark,
    color: "white !important",
    fontWeight: 600,
    borderRadius: 5,
    textAlign: "center",
    [theme.breakpoints.down('xs')]: {
      display: "block",
      marginLeft: 0,
      marginTop: 24
    }
  },
  table: {
    position: "relative",
  },
  domain: {
    marginTop: 4,
    color: theme.palette.grey[500]
  },
  cellDescription: {
    ...cellStyle(),
    minWidth: 350,
    [theme.breakpoints.down('md')]: {
      minWidth: 'initial'
    },
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  },
  cell: {
    ...cellStyle()
  },
  cellMeta: {
    ...cellStyle(),
    maxWidth: 210,
    color: 'rgba(0,0,0,0.6)',
    fontSize: "1rem"
  },
  metaType: {
    width: 50,
    display: "inline-block",
    marginRight: 6,
    color: theme.palette.grey[500]
  },
  cellTitle: {
    ...cellStyle(),
    color: 'rgba(0,0,0,0.6)',
    [theme.breakpoints.down('md')]: {
      display: "none"
    }
  },
  headerCell: {
    ...headerStyle(theme),
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  },
  headerCellDescription: {
    ...headerStyle(theme),
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  headerCellCategory: {
    ...headerStyle(theme),
    [theme.breakpoints.down('md')]: {
      display: "none"
    }
  },
  cellCategory: {
    ...cellStyle(),
    [theme.breakpoints.down('md')]: {
      display: "none"
    }
  },
  headerTitle: {
    ...headerStyle(theme),
    [theme.breakpoints.down('md')]: {
      display: "none"
    }
  },
  leftFixed0: {
    ...cellStyle(),
    paddingLeft: 6,
    paddingRight: 6,
    textAlign: "center",
    position: "relative",
    [theme.breakpoints.up('md')]: {
      position: "sticky",
      left: 0,
    }
  },
  leftFixedHeader0: {
    ...headerStyle(theme),
    [theme.breakpoints.up('md')]: {
      position: "sticky",
      left: 0,
      zIndex: 2, 
    },
    textAlign: 'center',
    paddingLeft: 6,
    paddingRight: 6,
  },
  leftFixed1: {
    ...cellStyle(),
    backgroundColor: 'white',
    position: "relative",
    [theme.breakpoints.up('md')]: {
      position: "sticky",
      left: 0,
    },
    minWidth: 400,
    boxShadow: "2px 0 2px -1px rgba(0,0,0,.15)",
    '& a': {
      color: theme.palette.primary.dark
    },
    [theme.breakpoints.down('md')]: {
      minWidth: 'initial'
    }
  },
  leftFixedHeader1: {
    ...headerStyle(theme),
    [theme.breakpoints.up('md')]: {
      position: "sticky",
      left: 0,
      zIndex: 3,
    },
    minWidth: 240
  },
  starIcon: {
    width: 16,
    position: "relative",
    top: 2
  },
  tabRow: {
    display: "flex",
    alignItems: "flex-start",
    paddingLeft: 8,
    flexWrap: "wrap-reverse",
    [theme.breakpoints.down('md')]: {
      marginTop: 60
    }
  },
  tab: {
    ...theme.typography.commentStyle,
    fontSize: "1rem",
    marginTop: 7,
    marginLeft: 2,
    marginRight: 2,
    marginBottom: -2,
    paddingLeft: 12,
    paddingRight: 12,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    borderRadius: 2,
    backgroundColor: theme.palette.grey[300],
    cursor: "pointer",
    boxShadow: "0 0 3px rgba(0,0,0,.3)",
    whiteSpace: "pre",
    height: 43,
    '&:hover': {
      backgroundColor: "white",
    }
  },
  tabLabel: {
    fontWeight: 600,
  },
  tabCount: {
    color: theme.palette.grey[600],
    fontSize: ".8rem",
    marginTop: 2,
  },
  tabDescription: {
    fontSize: "1rem"
  },
  tabSelected: {
    backgroundColor: theme.palette.grey[100],
    height: 47
  },
  headerSheet: {
    ...headerStyle(theme),
    maxWidth: 350,
    paddingLeft: 25,
    paddingRight: 25
  },
  cellSheet: {
    ...theme.typography.body1,
    width: 150,
    paddingLeft: 25,
    paddingRight: 25,
    fontWeight: 600,
    color: theme.palette.primary.main,
    cursor: "pointer",
    textAlign: "center",
    [theme.breakpoints.down('sm')]: {
      textAlign: "initial"
    }
  },
  cellSheetDescription: {
    width: 250,
    [theme.breakpoints.down('sm')]: {
      display: "none"
    }
  },
  link: {
    color: theme.palette.primary.dark,
    fontSize: '1.2em',
  },
  topLinks: {
    padding: 0,
    borderLeft: "solid 1px rgba(0,0,0,.1)",
    [theme.breakpoints.down('xs')]: {
      display: "none"
    }
  },
  topLinkRow: {
    display: "flex",
    borderBottom: "solid 1px rgba(0,0,0,.1)",
    alignItems: "center",
    fontSize: "1rem",
    '&:last-child': {
      borderBottom: "none"
    }
  },
  topLink: {
    minWidth: 400,
    maxWidth: 400,
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  topLinkDescription: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
    [theme.breakpoints.down('md')]: {
      display: "none"
    }
  },
  categoryRow: {
    borderBottom: `solid 5px ${theme.palette.grey[200]}`
  },
  added: {
    display: 'block'
  },
  updated: {
    display: 'block'
  },
  headerDateAdded: {
    ...headerStyle(theme),
    minWidth: 70,
    maxWidth: 70,
    textAlign: "center",
    [theme.breakpoints.down('md')]: {
      display: "none"
    }
  },
  headerLastUpdated: {
    ...headerStyle(theme),
    minWidth: 70,
    maxWidth: 70,
    textAlign: "center",
    [theme.breakpoints.down('md')]: {
      display: "none"
    }
  },
  cellDate: {
    fontSize: "1rem",
    textAlign: "center",
    color: 'rgba(0,0,0,0.6)',
    [theme.breakpoints.down('md')]: {
      display: "none"
    }
  },
  source: {
    fontSize: "1rem",
    color: theme.palette.grey[500]
  },
  description: {
    display: 'block'
  },
  smallDescription: {
    fontSize: '1rem',
    display: 'block',
    marginTop: 8,
    color: 'rgba(0,0,0,0.87)',
    lineHeight: '1.4',
    fontWeight: '500',
    [theme.breakpoints.up('md')]: {
      display: "none"
    }
  },
  reviewerThoughts: {
    display: 'block',
    color: 'rgba(0,0,0,0.6)',
    marginTop: 8,
    fontStyle: "italic"
  },
  selectedRow: {
    '& $leftFixed0': {
      backgroundColor: theme.palette.primary.main,
      color: 'white'
    }
  }
})

const SpreadsheetPage = ({classes}:{
  classes: any
}) => {
  const { query: { tab: selectedTab = "Intro" }, hash: selectedCell } = useLocation()
  const { LWTooltip, HoverPreviewLink, Loading, HeadTags } = Components
  const { data, loading } = useQuery(gql`
    query CoronaVirusData {
      CoronaVirusData {
        range
        majorDimension
        values {
          accepted
          imp
          link
          shortDescription
          url
          description
          domain
          type
          reviewerThoughts
          foundVia
          sourceLink
          sourceLinkDomain
          lastUpdated
          title
          dateAdded
          category
        } 
      }
    }
  `, {
    ssr: true
  });
  

  if (loading) return <Loading />

  const dataRows = _.filter(data.CoronaVirusData.values, row => row.accepted === "Accept")
  const sortedRowsAdded = _.sortBy(dataRows, row => -row.dateAdded)
  const sortedRowsImp = _.sortBy(sortedRowsAdded, row => -row.imp)

  const linkCell = (url, link, domain, type) => <div>
      <div className={classes.link}><HoverPreviewLink href={url} innerHTML={link}/></div>
      {domain && <div className={classes.domain}>{domain} {type && <span>• {type}</span>}</div>}
    </div>

  const tabs = [
    {
      label: "All Links",
      description: "All links that we've added, sorted by the most recent.",
      rows: sortedRowsAdded,
      showCategory: true
    },
    {
      label: "Guides/FAQs/Intros",
      displayLabel: "Guides/FAQs/Intros",
      description: "Websites that attempt to gently introduce coronavirus or explain things about it. Typically non-exhaustive.",
      rows: _.filter(sortedRowsImp, row => row.category === "Guides/FAQs/Intros")
    },
    {
      label: "Dashboards",
      description: "Websites showing up-to-date SC2-relevant numbers in easy-to-read format.",
      rows: _.filter(sortedRowsImp, row => row.category === "Dashboards")
    },
    {
      label: "Progression & Outcome",
      displayLabel: "Progression & Outcome",
      description: "Information on what happens once you have COVID-19.",
      rows: _.filter(sortedRowsImp, row => row.category === "Progression & Outcome")
    },
    {
      label: "Spread & Prevention",
      description: "Information about current or predicted prevalence, how COVID-19 is spread, or lower the former/preventing the latter. We may need a prevalence model olympics",
      rows: _.filter(sortedRowsImp, row => row.category === "Spread & Prevention")
    },
    {
      label: "Science",
      description: "Basic science that does not immediatley prompt action. E.g. 'here's what SC2 targets' is in, 'Here's a drug targeting that' is out.",
      rows: _.filter(sortedRowsImp, row => row.category === "Science")
    },
    {
      label: "Medical System",
      description: "Information or models on the current state of the medical system, including 'here's how bad hospitals are' and potential treatments.",
      rows: _.filter(sortedRowsImp, row => row.category === "Medical System")
    },
    {
      label: "Everyday Life",
      description: "Announcements of shutdowns, government or not.",
      rows: _.filter(sortedRowsImp, row => row.category === "Everyday Life")
    },
    {
      label: "DIY",
      description: "Advice on how to build and use medical supplies.",
      rows: _.filter(sortedRowsImp, row => row.category === "DIY")
    },
    {
      label: "Work & Donate",
      description: "Opportunities to help out. Volunteering and paid positions, as well as donation advice.",
      rows: _.filter(sortedRowsImp, row => row.category === "Work & Donate")
    },
    {
      label: "Aggregators",
      description: "Websites aggregating other content.",
      rows: _.filter(sortedRowsImp, row => row.category === "Aggregators")
    },
    {
      label: "Economics",
      description: "Information and models on the economic impact of C19",
      rows: _.filter(sortedRowsImp, row => row.category === "Economics")
    },
    {
      label: "Other",
      description: "Links that don’t fit into the current categories.",
      rows: _.filter(sortedRowsImp, row => row.category === "Other")
    }
  ]
  const currentTab = _.find(tabs, tab => tab.label === selectedTab)
  const rows = currentTab?.rows || []
  return (
    <div className={classes.root}>
      <HeadTags url={Utils.getSiteUrl() + "coronavirus-link-database"} image={"https://res.cloudinary.com/lesswrong-2-0/image/upload/v1585093292/Screen_Shot_2020-03-24_at_4.41.12_PM_qiwqwc.png"}/>
      {selectedTab == "Intro" && 
        <div className={classes.introWrapper}>
          <div className={classes.intro}>
            <p>
              Welcome to the Coronavirus Info-Database, an attempt to organize the disparate papers, articles and links that are spread all over the internet regarding the nCov pandemic. We sort, summarize and prioritize all links on a daily basis. You can submit new links by pressing the big green button.
            </p>
            <p>
              You can find (and participate) in more LessWrong discussion of COVID-19 on <HoverPreviewLink href={"/tag/coronavirus"} innerHTML="our tag page"/>.
            </p>
          </div>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSc5uVDXrowWmhlaDbT3kukODdJotWOZXZivdlFmaHQ6n2gsKw/viewform" className={classes.submitButton}>
            Submit New Link
          </a>
        </div>
      }
      <div className={classes.tabRow}>
        <LWTooltip key={"Intro"} placement="top" title={<div>
            {"What is this table about?"}
          </div>}>
            <QueryLink query={{tab: "Intro"}}>
              <div 
                className={classNames(classes.tab, {[classes.tabSelected]:selectedTab === "Intro"})}
              >
                <span className={classes.tabLabel}>
                  INTRO
                </span>
              </div>
            </QueryLink>
        </LWTooltip>
        {tabs.map(tab => <LWTooltip key={tab.label} placement="top" title={<div>
            {tab.description} ({tab.rows.length - 1})
          </div>}>
            <QueryLink query={{tab: tab.label}}>
              <div 
                className={classNames(classes.tab, {[classes.tabSelected]:tab.label === selectedTab})}
              >
                <div className={classes.tabLabel}>
                  {tab.displayLabel || tab.label}
                </div>
                <div className={classes.tabCount}>
                  {tab.rows.length - 1} links
                </div>
              </div>
            </QueryLink >
          </LWTooltip>)}
      </div>
      <div className={classes.table}>
        <Table>
          {selectedTab !== "Intro" ? <TableBody>
            <TableRow key={`row-0`}>
              <TableCell classes={{root: classes.leftFixedHeader0}}>
                <LWTooltip title="Importance">
                  <StarIcon className={classes.starIcon}/>
                </LWTooltip>
              </TableCell>
              <TableCell classes={{root: classes.leftFixedHeader1}}>
                Link
              </TableCell>
              <TableCell classes={{root: classes.headerCell}}>
                Summary
              </TableCell>
              {currentTab.showCategory &&  <TableCell classes={{root: classes.headerCellCategory}}>
                Category
              </TableCell>}
              <TableCell classes={{root: classes.headerDateAdded}}>
                Date Added
              </TableCell>
              <TableCell classes={{root: classes.headerLastUpdated}}>
                Last Updated
              </TableCell>
              <TableCell classes={{root: classes.headerTitle}}>
                Name / Opening Sentence
              </TableCell>
            </TableRow>
            {rows.map(({
              imp,
              link,
              url,
              description,
              domain,
              type,
              reviewerThoughts,
              foundVia,
              sourceLink,
              lastUpdated,
              title,
              dateAdded,
              category,
            }, rowNum) => (
              <TableRow key={`row-${rowNum}`} id={encodeURIComponent(url)} className={selectedCell === `#${encodeURIComponent(url)}` ? classes.selectedRow : ''} >
                <TableCell classes={{root: classes.leftFixed0}}>
                  <Link to={{hash: encodeURIComponent(url), search: `?${qs.stringify({tab: selectedTab})}`}}>{imp}</Link>
                </TableCell>
                <TableCell className={classes.leftFixed1}>
                  {linkCell(url, link, domain, type)}
                  <span className={classes.smallDescription}>
                    {description}
                  </span>
                </TableCell>
                <TableCell classes={{root: classes.cellDescription}}>
                  <span className={classes.description}>
                    {description}
                  </span>  
                  {reviewerThoughts && <span className={classes.reviewerThoughts}>
                    {reviewerThoughts}
                  </span>}
                </TableCell>
                {currentTab.showCategory && <TableCell classes={{root: classes.cellCategory}}>
                  {category}
                </TableCell>}
                <TableCell classes={{root: classes.cellDate}}>
                  {dateAdded}
                </TableCell>
                <TableCell classes={{root: classes.cellDate}}>
                  {lastUpdated}
                </TableCell>
                <TableCell classes={{root: classes.cellTitle}}>
                  <div>{title}</div>
                  {foundVia && <div className={classes.source}>
                    Found via <HoverPreviewLink href={sourceLink} innerHTML={foundVia}/>
                  </div>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody> 
          :
          <TableBody>
            <TableRow>
              <TableCell className={classes.headerSheet}>
                Sheet
              </TableCell>
              <TableCell className={classes.headerCellDescription}>
                Description
              </TableCell>
              <TableCell className={classes.headerCell}>
                Top Links
              </TableCell>
            </TableRow>
            {tabs.map(tab => {
              if (tab.label == "All Links") return null
              return <TableRow key={`intro-${tab.label}`} className={classes.categoryRow}>
                  <TableCell className={classes.cellSheet}>
                    <QueryLink query={{ tab: tab.label }}>{tab.displayLabel || tab.label}</QueryLink>
                    <span className={classes.smallDescription}>{tab.description}</span>
                  </TableCell>
                  <TableCell className={classes.cellSheetDescription}>
                    {tab.description}
                  </TableCell>
                  <TableCell className={classes.topLinks}>
                    {[0,1,2].map(rowNum => <div className={classes.topLinkRow} key={`topLink-${tab.label}-${rowNum}`}>
                        <div className={classes.topLink}>
                          {tab.rows[rowNum] && linkCell(tab.rows[rowNum].url, tab.rows[rowNum].link, tab.rows[rowNum].domain, tab.rows[rowNum].type)}
                        </div>
                        <div className={classes.topLinkDescription}>
                          {tab.rows[rowNum]?.description}
                        </div>
                    </div>)}
                  </TableCell>
                </TableRow>
            })}
          </TableBody>
          }
        </Table>
      </div>
    </div>
  )
}

const SpreadsheetPageComponent = registerComponent('SpreadsheetPage', SpreadsheetPage, {styles})

declare global {
  interface ComponentTypes {
    PostsSingle:typeof SpreadsheetPageComponent
  }
}
