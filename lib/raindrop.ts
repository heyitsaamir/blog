import axios from "axios";
import type { Bookmark } from "../interfaces/bookmark";

const raindropAxios = axios.create({
  baseURL: "https://api.raindrop.io/rest/v1",
  timeout: 1000,
});

const PUBLIC_RAINDROP_ID = 30149714;

type RaindropApiResponse =
  | ({
      result: true;
    } & {
      items: Bookmark[];
    })
  | {
      result: false;
    };

export async function getRaindrops() {
  try {
    const raindropsRes = await raindropAxios.get<RaindropApiResponse>(
      `raindrops/${PUBLIC_RAINDROP_ID}`,
      {
        headers: { Authorization: `Bearer ${process.env.RAINDROP_TOKEN}` },
      },
    );

    if (raindropsRes.data.result === true) {
      return raindropsRes.data.items;
    }
  } catch (e: any) {
    console.log(`Error getting bookmarks ${e.message}`);
  }
  return null;
}
