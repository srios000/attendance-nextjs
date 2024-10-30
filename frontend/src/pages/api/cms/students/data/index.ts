import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

/**
 * @swagger
 * /api/cms/students/data:
 *   get:
 *     summary: Get all students
 *     description: Retrieves a list of all students from the database. The 'features' field is excluded from the response.
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of students successfully retrieved
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
 *                   studentId:
 *                     type: string
 *                     example: "2024010001"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "john.doe@example.com"
 *                   group:
 *                     type: string
 *                     example: "4IA01"
 *                   semester:
 *                     type: number
 *                     example: 7
 *                   enrollmentYear:
 *                     type: number
 *                     example: 2024
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
 *     summary: Delete a student
 *     description: Deletes a specific student by their ID
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Student successfully deleted
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
 *         description: Student not found
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
  const studentsCollection = mongoose.connection.collection('students');
  

  if (req.method === 'GET') {
    const data = await studentsCollection.find({}).project({ features: 0 }).toArray();
    res.status(200).json(data);
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const result = await studentsCollection.deleteOne({ _id: new ObjectId(id as string) });
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
