
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { createUser, fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { deleteFile, fetchFileById, fetchFileByKey, fetchUserFiles } from '@/lib/actions/file.actions';
import { z } from 'zod';


export const appRouter = router({
    authCallback: publicProcedure.query(async () => {

        const user = await currentUser();

        if (!user?.id || !user.emailAddresses[0].emailAddress) throw new TRPCError({ code: 'UNAUTHORIZED' })
        //check if user is in the database?
        const dbUser = await fetchUser({
            id: user?.id
        });

        if (!dbUser) {
            //create user in db
            await createUser({
                id: user?.id,
                email: user.emailAddresses[0].emailAddress
            })
        }
        return { success: true }
    }),
    getUserFiles: privateProcedure.query(async ({ ctx }) => {
        const { userId } = ctx;

        return await fetchUserFiles({ userId })
    }),
    getFileUploadStatus: privateProcedure.input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const { userId } = ctx;
            const file = await fetchFileById({
                id: input.id,
                userId
            })
            if (!file) return { status: 'PENDING' as const }

            return { status: file.uploadStatus }

        }),
    getFile: privateProcedure.input(z.object({ key: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx

            const file = await fetchFileByKey({
                key: input.key,
                userId
            });

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' });

            return file;
        }),
    deleteFile: privateProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId } = ctx

            const file = await deleteFile({
                id: input.id,
                userId,
            })
            return file
        }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;