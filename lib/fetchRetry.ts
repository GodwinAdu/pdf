interface Props{
    url:string;
    maxRetries:number
}

export async function fetchDataWithRetry(url:string, maxRetries:number) {
    let currentRetry = 0;
    while (currentRetry < maxRetries) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return response;
            }
        } catch (error:any) {
            console.error(`Attempt ${currentRetry + 1} failed: ${error}`);
        }
        currentRetry++;
        // Implement exponential backoff here
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentRetry)));
    }
    throw new Error(`Failed to fetch data after ${maxRetries} attempts.`);
}