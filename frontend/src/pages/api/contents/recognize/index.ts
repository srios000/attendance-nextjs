import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

/**
 * @swagger
 * /api/contents/recognize:
 *   post:
 *     summary: Upload and process image for face recognition
 *     description: Accepts multipart form data with an image file and forwards it to the recognition service
 *     tags: [Face Recognition]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image_data
 *             properties:
 *               image_data:
 *                 type: string
 *                 format: binary
 *                 description: Image file to be processed for face recognition
 *     responses:
 *       200:
 *         description: Successfully processed the image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 recognitionData:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     confidence:
 *                       type: number
 *                       example: 0.95
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-29T10:30:00Z"
 *       404:
 *         description: Recognition service endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Endpoint Not Found"
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Error parsing form data"
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Internal Server Error"
 * 
 * components:
 *   schemas:
 *     UploadRequest:
 *       type: object
 *       required:
 *         - image_data
 *       properties:
 *         image_data:
 *           type: string
 *           format: binary
 *           description: The image file to be processed
 *     
 *     RecognitionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         recognitionData:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             confidence:
 *               type: number
 *             timestamp:
 *               type: string
 *               format: date-time
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message describing what went wrong
 * 
 * x-codeSamples:
 *   - lang: javascript
 *     label: Upload Image
 *     source: |
 *       const formData = new FormData();
 *       formData.append('image_data', imageFile);
 *       
 *       const response = await fetch('/api/upload', {
 *         method: 'POST',
 *         body: formData
 *       });
 *       
 *       const data = await response.json();
 * 
 * x-apiConfig:
 *   - bodyParser: false
 *   - sizeLimit: "10mb"
 */

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const form = formidable();
      
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          return res.status(500).json({ message: 'Error parsing form data' });
        }

        const formData = new FormData();
        if (files.image_data && Array.isArray(files.image_data) && files.image_data[0]) {
          const imageFile = files.image_data[0];
          const imageData = fs.readFileSync(imageFile.filepath);
          formData.append('image_data', new Blob([imageData]), imageFile.originalFilename || 'image_data');
        }

        console.log('formData', Object.fromEntries(formData));

        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL+'/api/recognize', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          res.status(200).json(data);
        } else if (response.status === 404) {
          res.status(404).json({ message: data.message || 'Endpoint Not Found' });
        } else {
          res.status(response.status).json({ message: data.message || 'An error occurred' });
        }
      });
    } catch (error) {
      console.error('Error in handler:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}