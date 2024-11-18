import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import User from '@/models/AdminModel';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * /api/contents/admins/update/{id}:
 *   put:
 *     summary: Update admin user
 *     description: Updates an admin user's information. Can update password (will be automatically hashed) and other fields. Requires internal authorization.
 *     tags: [Admins]
 *     security:
 *       - internalRequest: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the admin to update
 *         example: "67207981b4c8783c141817c6"
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
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newusername"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newemail@example.com"
 *               password:
 *                 type: string
 *                 description: If provided, will be hashed before storage
 *                 example: "newPassword123"
 *               role:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["admin"]
 *               manage:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["4IA01"]
 *     responses:
 *       200:
 *         description: Admin successfully updated
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
 *                       example: "67207981b4c8783c141817c6"
 *                     username:
 *                       type: string
 *                       example: "newusername"
 *                     email:
 *                       type: string
 *                       example: "newemail@example.com"
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
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
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
    // Check for internal request header
    const internalRequestToken = req.headers['x-internal-request-edit-user'];
    if (internalRequestToken !== process.env.NEXT_PUBLIC_ADMIN_ACCESS_HEADER) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await dbConnect();

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ success: false, error: 'Invalid ID' });
            }

            if (req.body.password) {
                const hashedPassword = await bcrypt.hash(req.body.password, 12);
                req.body.password = hashedPassword;
            }

            const updatedUser = await User.findByIdAndUpdate(id, req.body, { 
                new: true, 
                runValidators: true 
            }).select('-password -resetPasswordSecretAnswer');

            if (!updatedUser) {
                return res.status(404).json({ success: false, error: 'Admin not found' });
            }

            res.status(200).json({ success: true, data: updatedUser });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

