// import Image from "next/image";
import { useState } from "react";
import React from 'react';
// import Webcam from "react-webcam";
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';

const Home: React.FC = () => {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated' && session && session.user;
    const currentUser = session?.user;
    const userRoles = currentUser?.role || [];
    const userHasAccess = userRoles.some(role =>
        ['superadmin', 'admin', 'homeroom'].includes(role)
    );
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const fileName = file.name;

            if (file.type !== 'application/pdf') {
                Swal.fire('Error', 'Please upload a PDF file', 'error');
                return;
            }

            const fileNameParts = fileName.split('-');
            if (fileNameParts.length === 2 && fileName.toLowerCase().endsWith('.pdf')) {
                const [fileGroup, fileNameWithExtension] = fileNameParts;
                const fileNameWithoutExtension = fileNameWithExtension.split('.')[0];
                
                setGroup(fileGroup.toLowerCase());
                setName(fileNameWithoutExtension.toLowerCase());
                setPdfFile(file);
            } else {
                Swal.fire('Error', 'File name should be in the format "group-name.pdf"', 'error');
            }
        }
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (name && group && pdfFile) {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('group', group);
            formData.append('pdf_file', pdfFile);

            try {
                const res = await fetch('/api/contents/registration/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire(
                        'Success!',
                        'Your data has been added successfully!',
                        'success'
                    );
                } else {
                    Swal.fire(
                        'Oops...',
                        data.message || 'An error occurred while registering.',
                        'error'
                    );
                }
            } catch (err) {
                console.error(err);
                Swal.fire(
                    'Oops...',
                    'An error occurred while registering.',
                    'error'
                );
            }
        } else {
            Swal.fire(
                'Oops...',
                'Please upload a PDF file in the correct format (group-name.pdf)',
                'warning'
            );
        }
    };

    return (
        <>
            { !isAuthenticated || !userHasAccess ? (
                <div className="flex h-[80vh] items-center justify-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center">
                        You are not authorized to view this page.
                    </h2>
                </div>
            ) : (
                <>
                    <div className="flex max-w-full h-[80vh] dark:bg-gray-900 flex-col bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
                        <div className="flex flex-col md:flex-row md:items-center gap-10">
                            <main className="max-w-8xl flex-grow container px-4 py-10 mb-5 mx-auto p-2">
                                <section className="text-center mb-10">
                                        <div className="flex flex-col items-center p-4 space-y-4 select-none">
                                            <h3 className="text-3xl text-center mb-4 font-bold text-slate-800 dark:text-gray-200">Register Students by PDF</h3>
                                            <div className="dark:bg-gray-800 bg-gray-200 dark:text-gray-200 text-slate-800 p-4 rounded-lg shadow-md w-full max-w-lg">
                                                <form onSubmit={submit} className="flex flex-col items-center">
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            className="dark:bg-gray-900 dark:text-white bg-slate-100 text-slate-900 p-2 rounded-lg shadow-lg w-full"
                                                            onChange={handleFileChange}
                                                            required

                                                        />
                                                        <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-500 transition duration-200 mt-4">Register</button>
                                                </form>
                                            </div>
                                        </div>
                                </section>
                            </main>
                        </div>
                    </div>
                </>
            )}
            
        </>
        
    );
};

export default Home;
