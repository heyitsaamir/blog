import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  try {
    // Get the path to revalidate (defaults to index)
    const path = (req.query.path as string) || '/';

    // Trigger revalidation
    await res.revalidate(path);

    return res.json({
      revalidated: true,
      path,
      message: `Successfully revalidated ${path}`
    });
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).json({
      message: 'Error revalidating',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
