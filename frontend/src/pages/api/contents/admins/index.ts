
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/AdminModel';

/**
 * @swagger
 * /api/admins:
 *   get:
 *     summary: Get all administrators
 *     description: Retrieves a list of all administrator accounts. Requires internal authorization.
 *     tags: [Admins]
 *     security:
 *       - internalRequest: []
 *     parameters:
 *       - in: header
 *         name: x-internal-request
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal request verification token
 *         example: "291n#jbof!"
 *     responses:
 *       200:
 *         description: List of administrators successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       username:
 *                         type: string
 *                         example: "admin"
 *                       email:
 *                         type: string
 *                         example: "admin@example.com"
 *                       role:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["admin"]
 *                       manage:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["4IA01"]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: number
 *                   example: 1
 *       403:
 *         description: Forbidden - Invalid or missing internal request header
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *       400:
 *         description: Bad request or database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *       405:
 *         description: Method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Method not allowed"
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route hit');
  
  // Check for internal request header
  const internalRequestToken = req.headers['x-internal-request'];
  if (internalRequestToken !== process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  await dbConnect();
  console.log('Connected to database');
  
  if (req.method === 'GET') {
    try {
      const admins = await Admin.find({});
      if (admins.length === 0) {
        console.log('No admins found in the database');
      }
      res.status(200).json({ success: true, data: admins, count: admins.length });
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}