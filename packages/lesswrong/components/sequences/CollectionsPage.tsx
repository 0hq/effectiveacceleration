import React, { useState, useCallback } from 'react';
import { Components, registerComponent } from '../../lib/vulcan-lib';
import { useSingle } from '../../lib/crud/withSingle';
import Users from '../../lib/collections/users/collection';
import Collections from '../../lib/collections/collections/collection';
import Button from '@material-ui/core/Button';
import { Link } from '../../lib/reactRouterWrapper';
import { useCurrentUser } from '../common/withUser';
import Typography from '@material-ui/core/Typography';
import { postBodyStyles } from '../../themes/stylePiping'

const styles = theme => ({
  root: {
  },
  header: {
    marginBottom: 50,
  },
  startReadingButton: {
    background: "rgba(0,0,0, 0.05)",

    // TODO: Pick typography for this button. (This is just the typography that
    // Material UI v0 happened to use.)
    fontWeight: 500,
    fontSize: "14px",
    fontFamily: "Roboto, sans-serif",
  },
  title: {
    ...theme.typography.headerStyle,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderTopStyle: "solid",
    borderTopWidth: 4,
    lineHeight: 1,
    paddingTop: 10,
  },
  description: {
    fontSize: 20,
    marginTop: 30,
    marginBottom: 25,
    lineHeight: 1.25,
    maxWidth: 700,
    ...postBodyStyles(theme),
  },
});

const CollectionsPage = ({ documentId, classes }: {
  documentId: string,
  classes: ClassesType,
}) => {
  const currentUser = useCurrentUser();
  const [edit, setEdit] = useState(false);
  const { document, loading } = useSingle({
    documentId,
    collection: Collections,
    fragmentName: 'CollectionsPageFragment',
  });

  const showEdit = useCallback(() => {
    setEdit(true);
  }, []);
  const showCollection = useCallback(() => {
    setEdit(false);
  }, []);

  const { SingleColumnSection, BooksItem, BooksNewForm, SectionButton, ContentItemBody } = Components
  if (loading || !document) {
    return <Components.Loading />;
  } else if (edit) {
    return <Components.CollectionsEditForm
      documentId={document._id}
      successCallback={showCollection}
      cancelCallback={showCollection}
    />
  } else {
    const startedReading = false; //TODO: Check whether user has started reading sequences
    const collection = document;
    const canEdit = Users.canDo(currentUser, 'collections.edit.all') || (Users.canDo(currentUser, 'collections.edit.own') && Users.owns(currentUser, collection))
    const { html = "" } = collection.contents || {}
    
    // Workaround: MUI Button takes a component option and passes extra props to
    // that component, but has a type signature which fails to include the extra
    // props
    const ButtonUntyped = Button as any;
    
    return (<div className={classes.root}>
      <SingleColumnSection>
        <div className={classes.header}>
          <Typography variant="display3" className={classes.title}>{collection.title}</Typography>

          {canEdit && <SectionButton><a onClick={showEdit}>Edit</a></SectionButton>}

          <div className={classes.description}>
            {html && <ContentItemBody dangerouslySetInnerHTML={{__html: html}} description={`collection ${document._id}`}/>}
          </div>

          <ButtonUntyped
            className={classes.startReadingButton}
            component={Link} to={document.firstPageLink}
          >
            {startedReading ? "Continue Reading" : "Start Reading"}
          </ButtonUntyped>
        </div>
      </SingleColumnSection>
      <div>
        {/* For each book, print a section with a grid of sequences */}
        {collection.books.map(book => <BooksItem key={book._id} book={book} canEdit={canEdit} />)}
      </div>
      {canEdit && <SingleColumnSection>
        <BooksNewForm prefilledProps={{collectionId: collection._id}} />
      </SingleColumnSection>}
    </div>);
  }
}

const CollectionsPageComponent = registerComponent('CollectionsPage', CollectionsPage, {styles});

declare global {
  interface ComponentTypes {
    CollectionsPage: typeof CollectionsPageComponent
  }
}

