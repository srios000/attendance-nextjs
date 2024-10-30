import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';

/**
 * @swagger
 * /api/contents/registration/record:
 *   post:
 *     summary: Register a new user with image
 *     description: Accepts multipart form data with user details (name, group) and an image file for registration
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - group
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the person being registered
 *                 example: "John Doe"
 *               group:
 *                 type: string
 *                 description: Group or class identifier
 *                 example: "Class-A"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image for facial recognition
 *     responses:
 *       200:
 *         description: Successfully registered the user
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
 *                     id:
 *                       type: string
 *                       example: "user123"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     group:
 *                       type: string
 *                       example: "Class-A"
 *                     registrationTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-10-29T10:30:00Z"
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: name, group, or image"
 *       404:
 *         description: Registration service endpoint not found
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
 *     RegistrationRequest:
 *       type: object
 *       required:
 *         - name
 *         - group
 *         - image
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the person being registered
 *         group:
 *           type: string
 *           description: Group or class identifier
 *         image:
 *           type: string
 *           format: binary
 *           description: Profile image for facial recognition
 *     
 *     RegistrationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             group:
 *               type: string
 *             registrationTime:
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
 *     label: Register User
 *     source: |
 *       const formData = new FormData();
 *       formData.append('name', 'John Doe');
 *       formData.append('group', 'Class-A');
 *       formData.append('image', imageFile);
 *       
 *       const response = await fetch('/api/register', {
 *         method: 'POST',
 *         body: formData
 *       });
 *       
 *       const data = await response.json();
 * 
 * x-apiConfig:
 *   - bodyParser: false
 *   - formidable: true
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
        formData.append('name', Array.isArray(fields.name) ? fields.name[0] : fields.name || '');
        formData.append('group', Array.isArray(fields.group) ? fields.group[0] : fields.group || '');

        if (files.image && Array.isArray(files.image) && files.image[0]) {
          const imageFile = files.image[0];
          const imageData = fs.readFileSync(imageFile.filepath);
          formData.append('image', new Blob([imageData]), imageFile.originalFilename || 'image');
        }

        console.log('formData', Object.fromEntries(formData));

        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL+'/api/register', {
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