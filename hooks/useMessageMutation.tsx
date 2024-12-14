// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useSocket } from '@/provider/socket-provider';
// import { QueryData } from '@/types/message';

// interface MessageMutationProps {
//   queryKey: string;
//   other: string;
// }

// export const useMessageMutation = ({ queryKey, other }: MessageMutationProps) => {
//   const queryClient = useQueryClient();
//   const { socket } = useSocket();

//   return useMutation({
//     mutationFn: async (messageIds: string[]) => {
//       const response = await fetch("/api/messages/update-status", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ messageIds }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update message status");
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [queryKey] });
//       socket.emit("update", { queryKey, other });
//     },
//     onMutate: async (messageIds) => {
//       await queryClient.cancelQueries({ queryKey: [queryKey] });
//       const previousMessages = queryClient.getQueryData([queryKey]);

//       queryClient.setQueryData([queryKey], (oldData: QueryData | undefined) => {
//         if (!oldData?.pages?.length) return oldData;

//         return {
//           ...oldData,
//           pages: oldData.pages.map((page:any) => ({
//             ...page,
//             items: page.items.map((message:any) =>
//               messageIds.includes(message.id)
//                 ? { ...message, status: "READ" }
//                 : message
//             ),
//           })),
//         };
//       });

//       return { previousMessages}}