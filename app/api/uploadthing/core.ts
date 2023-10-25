
import { createFile, fetchCurrentPDF, updateUploadStatus } from '@/lib/actions/file.actions';
import { currentUser } from '@clerk/nextjs'
import {
    createUploadthing,
    type FileRouter,
} from 'uploadthing/next'

import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { getPineconeClient } from '@/lib/pinecone'
import { fetchDataWithRetry } from '@/lib/fetchRetry';
// import { getUserSubscriptionPlan } from '@/lib/stripe'
// import { PLANS } from '@/config/stripe'

const f = createUploadthing()

const middleware = async () => {

    const user = await currentUser();

    if (!user || !user.id) throw new Error('Unauthorized')

    //   const subscriptionPlan = await getUserSubscriptionPlan()

    return { userId: user.id }
}

const onUploadComplete = async ({
    metadata,
    file,
}: {
    metadata: Awaited<ReturnType<typeof middleware>>
    file: {
        key: string
        name: string
        url: string
    }
}) => {

    const data = {
        key: file.key,
        name: file.name,
        userId: metadata.userId,
        url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
        uploadStatus: 'PROCESSING',
    };

    await createFile(data)

    const fetchPdf = await fetchCurrentPDF({ key: file.key })

    console.log("files:", fetchPdf.url);

    try {
        console.log("starting",file.key)
        const value = `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
        const response = await fetchDataWithRetry(value, 10)
        const blob = await response.blob();
        const loader = new PDFLoader(blob);


        console.log("loader", loader)

        const pageLevelDocs = await loader.load()

        const pagesAmt = pageLevelDocs.length

        console.log(pagesAmt)

        // const { subscriptionPlan } = metadata
        // const { isSubscribed } = subscriptionPlan

        // const isProExceeded =
        //   pagesAmt >
        //   PLANS.find((plan) => plan.name === 'Pro')!.pagesPerPdf
        // const isFreeExceeded =
        //   pagesAmt >
        //   PLANS.find((plan) => plan.name === 'Free')!
        //     .pagesPerPdf

        // if (
        //   (isSubscribed && isProExceeded) ||
        //   (!isSubscribed && isFreeExceeded)
        // ) {
        //   await db.file.update({
        //     data: {
        //       uploadStatus: 'FAILED',
        //     },
        //     where: {
        //       id: createdFile.id,
        //     },
        //   })
        // }

        // vectorize and index entire document
        const pinecone = await getPineconeClient()
        const pineconeIndex = pinecone.Index('summaq')

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        })

        await PineconeStore.fromDocuments(
            pageLevelDocs,
            embeddings,
            {
                pineconeIndex,
                namespace: fetchPdf._id,
            }
        )
        console.log("updating id", fetchPdf._id)
        await updateUploadStatus({
            fileId: fetchPdf._id,
            newStatus: 'SUCCESS',
        });
    } catch (err: any) {
        console.error('Error in the try block:', err);
        await updateUploadStatus({
            fileId: fetchPdf._id,
            newStatus: 'FAILED',
        });
    }
}

export const ourFileRouter = {
    freePlanUploader: f({ pdf: { maxFileSize: '4MB' } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
    proPlanUploader: f({ pdf: { maxFileSize: '16MB' } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
