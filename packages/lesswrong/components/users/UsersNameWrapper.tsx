import { Components, registerComponent } from "../../lib/vulcan-lib";
import { useSingle } from "../../lib/crud/withSingle";
import React from "react";

// Given a user ID (as documentId), load that user with a HoC, and display
// their name. If the nofollow attribute is true OR the user has a spam-risk
// score below 0.8, the user-page link will be marked nofollow.
const UsersNameWrapper = ({
  documentId,
  nofollow = false,
  simple = false,
  className,
}: {
  documentId: string;
  nofollow?: boolean;
  simple?: boolean;
  className?: string;
}) => {
  const { document, loading } = useSingle({
    documentId,
    collectionName: "Users",
    fragmentName: "UsersMinimumInfo",
  });

  console.log("DocumentID", documentId, document, loading);

  if (!document && loading) {
    return <Components.Loading />;
  } else if (document) {
    return (
      <Components.UsersNameDisplay
        user={document}
        nofollow={nofollow || document.spamRiskScore < 0.8}
        simple={simple}
        className={className}
      />
    );
  } else {
    return <Components.UserNameDeleted />;
  }
};

const UsersNameWrapperComponent = registerComponent("UsersNameWrapper", UsersNameWrapper);

declare global {
  interface ComponentTypes {
    UsersNameWrapper: typeof UsersNameWrapperComponent;
  }
}
