import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

const SwaggerUI = dynamic<{
  spec: any;
}>(import('swagger-ui-react'), { ssr: false });

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-700">
        <div className="max-w-5xl mx-auto w-full px-4 flex h-16 items-center justify-between">
          <h1 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            API Documentation
          </h1>
          
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-400 shadow-lg">
          <div className="p-6">
            {/* Description */}
            <div className="mb-8 space-y-2">
              {/* <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Welcome to our API</h2>
              <p className="text-sm text-gray-600 dark:text-gray-200">
                Explore and test our API endpoints using the interactive documentation below. 
                Use the examples and try out different endpoints to understand how they work.
              </p> */}
            </div>

            {/* Custom styles for Swagger UI */}
            <style jsx global>{`

              .swagger-ui {
                font-family: inherit;
                max-width: 100%;
                margin: 0 auto;
                color: var(--swagger-text);
              }

              .swagger-ui .wrapper {
                padding: 0;
                max-width: 100%;
                margin: 0 auto;
              }
              
              /* Light theme styles */
              :root {
                --swagger-bg: #ffffff;
                --swagger-text: #1f2937;
                --swagger-border: #e5e7eb;
                --swagger-input-bg: #ffffff;
                --swagger-input-border: #d1d5db;
                --swagger-btn-bg: #f3f4f6;
              }
              
              /* Dark theme styles */
              [data-theme='dark'] {
                --swagger-bg: #000000;
                --swagger-text: #f3f4f6;
                --swagger-border: #374151;
                --swagger-input-bg: #111827;
                --swagger-input-border: #374151;
                --swagger-btn-bg: #1f2937;
              }

              .swagger-ui .info {
                margin: 0;
                padding: 0;
              }

              .swagger-ui .scheme-container {
                background: var(--swagger-bg);
                box-shadow: none;
                padding: 0;
                margin: 0;
              }

              .swagger-ui .opblock {
                border: 1px solid var(--swagger-border);
                background: var(--swagger-bg);
                margin: 0 0 1rem;
              }

              .swagger-ui select,
              .swagger-ui input[type="text"],
              .swagger-ui textarea {
                background: var(--swagger-input-bg);
                border: 1px solid var(--swagger-input-border);
                color: var(--swagger-text);
              }

              .swagger-ui .btn {
                background: var(--swagger-btn-bg);
                color: var(--swagger-text);
                border: 1px solid var(--swagger-input-border);
              }

              .swagger-ui .opblock-tag {
                border-bottom: 1px solid var(--swagger-border);
                color: var(--swagger-text);
              }

              .swagger-ui table tbody tr td {
                border-color: var(--swagger-border);
                color: var(--swagger-text);
              }

              .swagger-ui .model-box {
                background: var(--swagger-bg);
              }

              .swagger-ui .model {
                color: var(--swagger-text);
              }

              .swagger-ui .opblock-description-wrapper p,
              .swagger-ui .opblock-external-docs-wrapper p,
              .swagger-ui .opblock-title_normal p {
                color: var(--swagger-text) !important;
              }

              .swagger-ui .title h2{
                color: var(--swagger-text) !important;
              }

              .swagger-ui .opblock-summary-description {
                color: var(--swagger-text) !important;
              }
                
            `}</style>

              <SwaggerUI 
                spec={spec}
              />
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 md:py-0">
        <div className="max-w-5xl mx-auto w-full px-4 flex flex-col md:h-16 md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with Next.js and Swagger UI
          </p>
        </div>
      </footer>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const spec: Record<string, any> = createSwaggerSpec({
    apiFolder: 'src/pages/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Next Swagger API',
        version: '1.0',
      },
    },
  });

  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc;