import { Tab, TabList, TabPanel, useDialogState } from "reakit"
// import {
//   useAnnotatedDocumentByIdQuery,
//   useBookmarkedDocumentsQuery,
// } from "src/graphql/dailp"
import { useScrollableTabState } from "src/scrollable-tabs"
import { BookmarkCard } from "./bookmark-card"
import * as css from "./dashboard.css"

enum Tabs {
  ACTIVITY = "activity-tab",
  BOOKMARKS = "bookmarks-tab",
}

export const Dashboard = () => {
  const tabs = useScrollableTabState({ selectedId: Tabs.ACTIVITY })
  return (
    <>
      <h1 className={css.dashboardHeader}>Dashboard</h1>
      <div className={css.wideAndTop}>
        <TabList
          {...tabs}
          id="document-tabs-header"
          className={css.dashboardTabs}
          aria-label="Document View Types"
        >
          <Tab {...tabs} id={Tabs.ACTIVITY} className={css.dashboardTab}>
            Recent Activity
          </Tab>
          <Tab {...tabs} id={Tabs.BOOKMARKS} className={css.dashboardTab}>
            Bookmarked Documents
          </Tab>
        </TabList>

        <TabPanel
          {...tabs}
          id={Tabs.ACTIVITY}
          className={css.dashboardTabPanel}
        >
          <ActivityTab />
        </TabPanel>

        <TabPanel
          {...tabs}
          id={Tabs.BOOKMARKS}
          className={css.dashboardTabPanel}
        >
          <BookmarksTab />
        </TabPanel>
      </div>
    </>
  )
}

export const ActivityTab = () => {
  // takes in something (user?)
  const dialog = useDialogState({ animated: true, visible: true })
  return (
    <>
      <ul className={css.noBullets}>
        <li>
          <ActivityItem />
        </li>
        <li>
          <ActivityItem />
        </li>
        <li>
          <ActivityItem />
        </li>
      </ul>
    </>
  )
}

export const BookmarksTab = () => {
  // const [{ data }] = useBookmarkedDocumentsQuery()
  return (
    <>
      {/* <ul className={css.noBullets}>
        {data?.bookmarkedDocuments?.map((doc: any) => (
          <li key={doc.id}>
            <BookmarksTabItem documentId={doc.id} />
          </li>
        ))}
      </ul> */}
    </>
  )
}

export const BookmarksTabItem = (props: { documentId: string }) => {
  // const [{ data: doc }] = useAnnotatedDocumentByIdQuery({
  //   variables: { docId: props.documentId },
  // })
  // const docData = doc?.documentByUuid
  // const docFullPath = docData?.chapters?.[0]?.path
  // let docPath = ""
  // if (docFullPath?.length !== undefined && docFullPath?.length > 0) {
  //   docPath = docFullPath[0] + "/" + docFullPath[docFullPath.length - 1]
  // }
  // console.log(docPath)
  // const thumbnailUrl = ((docData?.translatedPages?.[0]?.image?.url +
  //   "/pct:0,0,50,50/500,500/0/default.jpg") as unknown) as string
  return (
    <>
      <div className="cardShadow">
        <BookmarkCard
          // thumbnail={thumbnailUrl}
          thumbnail=""
          header={{
            // text: (docData?.title as unknown) as string,
            text: "",
            // link: `/collections/${docPath}`,
            link: "",
          }}
          // description={(docData?.date?.year as unknown) as string}
          description=""
        />
      </div>
    </>
  )
}

export const ActivityItem = () => {
  // takes in user and some id for the post?
  return (
    <>
      <div className={css.dashboardItem}>
        <p>Recent activity test</p>
      </div>
    </>
  )
}
