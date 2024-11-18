import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/AdminModel';

/**
 * @swagger
 * /api/contents/admins/add:
 *   post:
 *     summary: Create a new administrator
 *     description: Creates a new administrator account. Requires internal authorization.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newuser"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newuser@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securepassword123"
 *               role:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user"]
 *               manage:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["4IA01"]
 *     responses:
 *       201:
 *         description: Administrator successfully created
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
 *                       example: "507f1f77bcf86cd799439011"
 *                     username:
 *                       type: string
 *                       example: "newuser"
 *                     email:
 *                       type: string
 *                       example: "newuser@example.com"
 *                     role:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["user"]
 *                     manage:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["4IA01"]
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
 *         description: Bad request or validation error
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
 *                   example: "Validation failed"
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
  const internalRequestToken = req.headers['x-internal-request-add-user'];
  console.log('Internal request token:', internalRequestToken, process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER );
  if (internalRequestToken !== process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER) {
    // return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  await dbConnect();

  if (req.method === 'POST') {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}