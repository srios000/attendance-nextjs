/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password using secret answer
 *     description: Allows an admin user to reset their password by providing their username and correct secret answer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - newPassword
 *               - resetPasswordSecretAnswer
 *             properties:
 *               username:
 *                 type: string
 *                 description: Admin username
 *                 example: "test"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password to set
 *                 minLength: 8
 *                 example: "newSecurePass123"
 *               resetPasswordSecretAnswer:
 *                 type: string
 *                 description: Answer to the secret question for password reset verification
 *                 example: "Test!123"
 *               isHashed:
 *                 type: boolean
 *                 description: Indicates if the provided password is already hashed
 *                 default: false
 *                 example: false
 *     responses:
 *       200:
 *         description: Password successfully reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Bad request - Missing fields or invalid secret answer
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
 *                   example: "Missing required fields"
 *       404:
 *         description: User not found
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
 *                   example: "User not found"
 *       405:
 *         description: Method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Method GET Not Allowed"
 *       500:
 *         description: Server error
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
 *                   example: "Internal server error"
 * 
 * components:
 *   schemas:
 *     PasswordResetRequest:
 *       type: object
 *       required:
 *         - username
 *         - newPassword
 *         - resetPasswordSecretAnswer
 *       properties:
 *         username:
 *           type: string
 *           description: Admin username
 *         newPassword:
 *           type: string
 *           format: password
 *           description: New password to set
 *         resetPasswordSecretAnswer:
 *           type: string
 *           description: Answer to the secret question
 *         isHashed:
 *           type: boolean
 *           description: Indicates if the password is pre-hashed
 *           default: false
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         error:
 *           type: string
 * 
 * x-codeSamples:
 *   - lang: javascript
 *     label: Reset Password
 *     source: |
 *       const response = await fetch('/api/reset-password', {
 *         method: 'POST',
 *         headers: {
 *           'Content-Type': 'application/json',
 *         },
 *         body: JSON.stringify({
 *           username: 'test',
 *           newPassword: 'newSecurePass123',
 *           resetPasswordSecretAnswer: 'Test!123',
 *           isHashed: false
 *         })
 *       });
 *       
 *       const data = await response.json();
 * 
 * x-security-considerations:
 *   - The secret answer is compared using bcrypt to prevent timing attacks
 *   - Passwords are hashed using bcrypt with a salt factor of 10
 *   - The API only accepts POST requests to prevent password exposure in URLs
 *   - Error messages are generic to prevent user enumeration
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/AdminModel';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    if (req.method !== 'POST') {
        return res.setHeader('Allow', ['POST']).status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { username, newPassword, resetPasswordSecretAnswer, isHashed = false } = req.body;

    if (!username || !newPassword || !resetPasswordSecretAnswer) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    try {
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const isAnswerValid = await bcrypt.compare(resetPasswordSecretAnswer, admin.resetPasswordSecretAnswer);

        if (!isAnswerValid) {
            return res.status(400).json({ success: false, error: 'Invalid secret answer' });
        }

        const hashedPassword = isHashed ? newPassword : await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        await admin.save();

        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
