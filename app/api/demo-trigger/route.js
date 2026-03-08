

export async function POST() {
    try {
        const payLoad = {
            id: 'demo-123',
            allImageBaseUrl: `https://ik.imagekit.io/ilunarivanthesecond/images`,
            imageUrls: `https://ik.imagekit.io/ilunarivanthesecond/imageArray.json?updatedAt=${Date.now()}`,
            audio: `https://ik.imagekit.io/ilunarivanthesecond/audio.mp3?updatedAt=${Date.now()}`,
            subtitles: `https://ik.imagekit.io/ilunarivanthesecond/subtitles.json?updatedAt=${Date.now()}`,
            basicData: `https://ik.imagekit.io/ilunarivanthesecond/basicData.json?updatedAt=${Date.now()}`,
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