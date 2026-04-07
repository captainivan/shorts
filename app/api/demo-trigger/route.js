

export async function POST() {
    const BASE_URL= process.env.IMAGEKIT_URL_ENDPOINT;
    try {
        const payLoad = {
            id: 'demo-123',
            allImageBaseUrl: `${BASE_URL}/images`,
            imageUrls: `${BASE_URL}/imageArray.json?updatedAt=${Date.now()}`,
            audio:     `${BASE_URL}/audio.mp3?updatedAt=${Date.now()}`,
            subtitles: `${BASE_URL}/subtitles.json?updatedAt=${Date.now()}`,
            basicData: `${BASE_URL}/basicData.json?updatedAt=${Date.now()}`,
        }

        const res = await fetch(
            "https://api.github.com/repos/captainivan/shorts/dispatches",
            {
                method: "POST",
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
                },
                body: JSON.stringify({
                    event_type: "run_video_render",
                    client_payload: payLoad
                })
            }
        );

        if (!res.ok) {
            const errText = await res.text();
            return Response.json({ error: errText }, { status: 500 });
        }

        return Response.json({
            status: "GitHub Action started!",
            sentPayload: payLoad
        });

    } catch (error) {
        console.log(error);
        return Response.json({ success: false, message: error })
    }
}