import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

/**
 * @swagger
 * /api/cms/attendance/data:
 *   get:
 *     summary: Get all attendance records
 *     description: Retrieves a list of all attendance records from the database
 *     tags: [Attendance]
 *     responses:
 *       200:
 *         description: List of attendance records successfully retrieved
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
 *                     example: "12345"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-10-29T08:00:00.000Z"
 *                   status:
 *                     type: string
 *                     example: "present"
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
 *     summary: Delete an attendance record
 *     description: Deletes a specific attendance record by its ID
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the attendance record to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Attendance record successfully deleted
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
 *         description: Attendance record not found
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
  const attendanceCollection = mongoose.connection.collection('attendance');

  if (req.method === 'GET') {
    const data = await attendanceCollection.find({}).toArray();
    res.status(200).json(data);
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const result = await attendanceCollection.deleteOne({ _id: new ObjectId(id as string) });
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
