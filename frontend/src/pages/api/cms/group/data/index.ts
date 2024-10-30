import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

/**
 * @swagger
 * /api/cms/group/data:
 *   get:
 *     summary: Get all groups
 *     description: Retrieves a list of all groups from the database
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of groups successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
 *                   name:
 *                     type: string
 *                     example: "4IA01"
 *                   description:
 *                     type: string
 *                     example: "Information Systems Class of 2024"
 *                   members:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["studentId1", "studentId2"]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-29T08:00:00.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-29T08:00:00.000Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *   delete:
 *     summary: Delete a group
 *     description: Deletes a specific group by its ID
 *     tags: [Groups]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Group successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Record deleted successfully"
 *       400:
 *         description: Invalid ID provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid ID"
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Record not found"
 *       405:
 *         description: Method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Method not allowed"
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const groupCollection = mongoose.connection.collection('groups');

  if (req.method === 'GET') {
    const data = await groupCollection.find({}).toArray();
    res.status(200).json(data);
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const result = await groupCollection.deleteOne({ _id: new ObjectId(id as string) });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: 'Record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
