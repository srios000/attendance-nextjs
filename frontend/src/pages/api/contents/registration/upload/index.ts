// pages/api/contents/registration/upload/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';

/**
 * @swagger
 * /api/contents/registration/upload:
 *   post:
 *     summary: Register user from PDF document
 *     description: Accepts multipart form data with user details and a PDF file for registration
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
 *               - pdf_file
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the person being registered
 *                 example: ""
 *               group:
 *                 type: string
 *                 description: Group or class identifier
 *                 example: ""
 *               pdf_file:
 *                 type: string
 *                 format: binary
 *                 description: PDF document for registration
 *     responses:
 *       200:
 *         description: Successfully processed the registration
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
 *                     registrationId:
 *                       type: string
 *                       example: ""
 *                     name:
 *                       type: string
 *                       example: ""
 *                     group:
 *                       type: string
 *                       example: ""
 *                     processedAt:
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
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
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
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while processing the request"
 *                 details:
 *                   type: string
 *                   example: "Error reading file"
 *       502:
 *         description: Bad gateway - Error communicating with backend server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error communicating with backend server"
 *                 details:
 *                   type: string
 *                   example: "Backend responded with status: 500"
 * 
 * components:
 *   schemas:
 *     PDFRegistrationRequest:
 *       type: object
 *       required:
 *         - name
 *         - group
 *         - pdf_file
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the person being registered
 *         group:
 *           type: string
 *           description: Group or class identifier
 *         pdf_file:
 *           type: string
 *           format: binary
 *           description: PDF document for registration
 *     
 *     RegistrationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             registrationId:
 *               type: string
 *             name:
 *               type: string
 *             group:
 *               type: string
 *             processedAt:
 *               type: string
 *               format: date-time
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *         details:
 *           type: string
 *           description: Additional error details when available
 * 
 * x-codeSamples:
 *   - lang: javascript
 *     label: Register with PDF
 *     source: |
 *       const formData = new FormData();
 *       formData.append('name', 'John Doe');
 *       formData.append('group', 'Class-A');
 *       formData.append('pdf_file', pdfFile);
 *       
 *       const response = await fetch('/api/contents/registration/upload', {
 *         method: 'POST',
 *         body: formData
 *       });
 *       
 *       const data = await response.json();
 * 
 * x-apiConfig:
 *   - bodyParser: false
 *   - formidable:
 *       multiples: true
 *       keepExtensions: true
 */

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = await new Promise((resolve, reject) => {
        const form = new IncomingForm({
          multiples: true,
          keepExtensions: true,
        });
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { fields, files } = data as { fields: any; files: any };
      const name = fields.name[0];
      const group = fields.group[0];
      const pdfFile = files.pdf_file[0];

      if (!name || !group || !pdfFile) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // console.log('Fields:', fields);
      // console.log('Files:', files);

      // Read the file content
      const fileContent = await fs.readFile(pdfFile.filepath);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('group', group);
      formData.append('pdf_file', new Blob([fileContent]), pdfFile.originalFilename);

      try {
        const backendResponse = await fetch(process.env.NEXT_PUBLIC_BACKEND_API_URL+'/api/register_from_pdf', {
          method: 'POST',
          body: formData,
        });

        if (!backendResponse.ok) {
          throw new Error(`Backend responded with status: ${backendResponse.status}`);
        }

        const backendData = await backendResponse.json();

        // Clean up the temporary file
        await fs.unlink(pdfFile.filepath);

        res.status(200).json(backendData);
      } catch (error) {
        console.error('Error communicating with backend:', error);
        res.status(502).json({ error: 'Error communicating with backend server', details: error.message });
      }
    } catch (error) {
      console.error('Error in API route:', error);
      res.status(500).json({ error: 'An error occurred while processing the request', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}