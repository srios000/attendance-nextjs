/**
 * @swagger
 * /api/contents/admins/delete/{id}:
 *   delete:
 *     summary: Delete an administrator
 *     description: Deletes a specific administrator by ID. Requires internal authorization.
 *     tags: [Admins]
 *     security:
 *       - internalRequest: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the admin to delete
 *         example: "67207981b4c8783c141817c6"
 *       - in: header
 *         name: x-internal-request
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal request verification token
 *     responses:
 *       204:
 *         description: Administrator successfully deleted
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
 *         description: Administrator not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
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
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/AdminModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  const internalRequestToken = req.headers['x-internal-request'];
  if (internalRequestToken !== process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  await dbConnect();

  if (method === 'DELETE') {
    try {
      const deletedUser = await User.deleteOne({ _id: id });
      if (!deletedUser.deletedCount) {
        return res.status(404).json({ success: false });
      }
      res.status(204).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}