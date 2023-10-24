import { Pinecone } from '@pinecone-database/pinecone'

export const getPineconeClient = async () => {
    const pinecone = new Pinecone({
        environment: "gcp-starter",      
        apiKey:process.env.PINECONE_API_KEY!
    });      

  return pinecone;
}
