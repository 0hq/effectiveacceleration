
export const getCKEditorDocumentId = (documentId: string, userId: string, formType: string) => {
  if (documentId) return `${documentId}-${formType}`
  return `${userId}-${formType}`
}

export function generateTokenRequest(documentId?: string, userId?: string, formType?: string) {
  return () => {
    return new Promise( ( resolve, reject ) => {
        const xhr = new XMLHttpRequest();
  
        xhr.open( 'GET', '/ckeditor-token' );
  
        xhr.addEventListener( 'load', () => {
            const statusCode = xhr.status;
            const xhrResponse = xhr.response;
  
            if ( statusCode < 200 || statusCode > 299 ) {
                return reject( new Error( 'Cannot download a new token!' ) );
            }
  
            return resolve( xhrResponse );
        } );
  
        xhr.addEventListener( 'error', () => reject( new Error( 'Network error' ) ) );
        xhr.addEventListener( 'abort', () => reject( new Error( 'Abort' ) ) );
  
        if (documentId) xhr.setRequestHeader( 'document-id', documentId );
        if (userId) xhr.setRequestHeader( 'user-id', userId );
        if (formType) xhr.setRequestHeader( 'form-type', formType );
  
        xhr.send();
    } );
  }
}
