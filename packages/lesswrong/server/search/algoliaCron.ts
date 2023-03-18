import { DatabasePublicSetting } from "../../lib/publicSettings";
import { addCronJob } from "../cronUtil";
import { algoliaCleanAll, algoliaExportAll } from "../scripts/algoliaExport";

// NB: This setting will set you back like $500/mo
const algoliaAutoSyncIndexesSetting = new DatabasePublicSetting<boolean>(
  "algolia.autoSyncIndexes",
  process.env.NODE_ENV === "production"
);

addCronJob({
  name: "updateAlgoliaIndex",
  interval: "every 24 hours",
  job: async () => {
    if (algoliaAutoSyncIndexesSetting.get()) {
      await algoliaExportAll();
      await algoliaCleanAll();
    } else {
      // eslint-disable-next-line no-console
      console.log("Auto-rebuild of Algolia indexes not enabled in config");
    }
  },
});
