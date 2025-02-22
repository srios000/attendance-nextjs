import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/AdminModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  console.log("connected to db");

  const { id } = req.query;

  // const isInternalRequest = req.headers['x-internal-request'] === 'true';

  // if (!isInternalRequest) {
  //   return res.status(403).json({ success: false, error: 'Forbidden' });
  // }

  if (req.method === 'GET') {
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.status(200).json({ success: true, data: admin });
    //eslint-disable-next-line
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
