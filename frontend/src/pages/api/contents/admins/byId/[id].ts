import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/AdminModel';

/**
 * @swagger
 * /api/contents/admins/byId/{id}:
 *   get:
 *     summary: Get admin details by ID
 *     description: Retrieves details of a specific admin. This endpoint requires internal authorization and excludes sensitive fields (password and resetPasswordSecretAnswer).
 *     tags: [Admins]
 *     security:
 *       - internalRequest: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the admin to retrieve
 *         example: "671febf7ec4ad1bade7e9194"
 *       - in: header
 *         name: x-internal-request
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['true']
 *         description: Internal request verification header
 *     responses:
 *       200:
 *         description: Admin details successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671febf7ec4ad1bade7e9194"
 *                     username:
 *                       type: string
 *                       example: "admin"
 *                     email:
 *                       type: string
 *                       example: "admin@example.com"
 *                     role:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["admin"]
 *                     manage:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["4IA01"]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-29T08:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-29T08:00:00.000Z"
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
 *       404:
 *         description: Admin not found
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
 *                   example: "Admin not found"
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
  await dbConnect();

  const { id } = req.query;

  const isInternalRequest = req.headers['x-internal-request'] === 'true';

  if (!isInternalRequest) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  if (req.method === 'GET') {
    try {
      const user = await Admin.findById(id).select('-password -resetPasswordSecretAnswer');
      if (!user) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }
      res.status(200).json({ success: true, data: user });
      //eslint-disable-next-line
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
