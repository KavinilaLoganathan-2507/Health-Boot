import {
  NextRequest,
  NextResponse,
} from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const API_KEY = process.env.ELEVENLABS_API_KEY;
        console.log(API_KEY);
        if (!API_KEY) {
            return new Response("API key not found", { status: 500 });
        }

        const { text } = await request.json();
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb`,
            {
                method: "POST",
                headers: {
                    Accept: "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": API_KEY,
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            }
        );

        if (!response.ok) {
            console.error(response);
            return new Response("Failed to generate audio", { status: 500 });
        }

        const audioBuffer = await response.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString("base64");

        return NextResponse.json({ audio: audioBase64 });
    } catch (e) {
        console.error(e);
        return new Response("Internal server error", { status: 500 });
    }
}
