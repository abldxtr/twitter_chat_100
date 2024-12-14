// import { useCallback, useRef, useEffect } from 'react';
// // import { useMessageMutation } from './useMessageMutation';

// interface BatchedUpdateOptions {
//   queryKey: string;
//   other: string;
//   batchTimeout?: number;
// }

// export const useBatchedMessageUpdate = ({
//   queryKey,
//   other,
//   batchTimeout = 2000,
// }: BatchedUpdateOptions) => {
//   const pendingMessagesRef = useRef<Set<string>>(new Set());
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
// //   const { mutate } = useMessageMutation({ queryKey, other });

//   const processBatch = useCallback(() => {
//     if (pendingMessagesRef.current.size > 0) {
//       const messageIds = Array.from(pendingMessagesRef.current);
//     //   mutate(messageIds);
//       pendingMessagesRef.current.clear();
//     }
//   }, [mutate]);

//   const addMessageToBatch = useCallback((messageId: string) => {
//     pendingMessagesRef.current.add(messageId);
    
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
    
//     timeoutRef.current = setTimeout(processBatch, batchTimeout);
//   }, [batchTimeout, processBatch]);

//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//       processBatch();
//     };
//   }, [processBatch]);

//   return { addMessageToBatch };
// }