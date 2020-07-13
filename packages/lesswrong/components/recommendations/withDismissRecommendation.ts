import { useCallback } from 'react';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';

export const useDismissRecommendation = () => {
  const [mutate] = useMutation(gql`
    mutation dismissRecommendation($postId: String) {
      dismissRecommendation(postId: $postId)
    }
  `);
  
  return useCallback(async (postId: string) => {
    await mutate({
      variables: { postId }
    });
  }, [mutate]);
}
