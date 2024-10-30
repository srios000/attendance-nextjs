import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import React from 'react';
import Webcam from "react-webcam";
import Swal from 'sweetalert2';


const Home: React.FC = () => {
    const [name, setName] = useState('');
    const [group, setGroup] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isImageCaptured, setImageCaptured] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = useState('');

    const capture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
            setImageCaptured(true);
        }
    };

    const submit = async (event) => {
        event.preventDefault();
        if (name && group && capturedImage) {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('group', group);
        
            const response = await fetch(capturedImage);
            const blob = await response.blob();
        
            formData.append('image', blob, 'image.jpg');
        
            try {
                const res = await fetch('/api/contents/registration/record', {
                    method: 'POST',
                    body: formData,
                });
    
                const data = await res.json();
    
                if (res.ok) {
                    Swal.fire(
                        'Success!',
                        'Your data has been added successfully!',
                        'success'
                    ).then(() => {
                        setImageCaptured(false);
                        setCapturedImage(null);
                    });
                } else {
                    Swal.fire(
                        'Oops...',
                        data.message || 'An error occurred while registering.',
                        'error'
                    ).then(() => {
                        setImageCaptured(false);
                        setCapturedImage(null);
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire(
                    'Oops...',
                    'An error occurred while registering.',
                    'error'
                ).then(() => {
                    setImageCaptured(false);
                    setCapturedImage(null);
                });
            }
        } else {
            Swal.fire(
                'Oops...',
                'Please complete all fields and capture your photo',
                'warning'
            ).then(() => {
                setImageCaptured(false);
                setCapturedImage(null);
            });
        }
    };
    

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setVideoDevices(videoDevices);
            setSelectedDevice(videoDevices[0]?.deviceId); 
        });
    }, []);
    
    const handleDeviceChange = (event) => {
        setSelectedDevice(event.target.value);
    };

    return (
        <div className="flex max-w-full min-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200">
            <main className="flex-grow container mx-auto px-4 py-10">
                <section className="max-w-2xl mx-auto">
                    <h3 className="text-3xl text-center mb-8 font-bold">Register</h3>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="flex justify-center mb-6">
                                {!isImageCaptured ? (
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ deviceId: selectedDevice }}
                                        className="w-full max-w-md h-auto rounded-lg"
                                    />
                                ) : (
                                    capturedImage ? (
                                        <Image
                                            src={capturedImage}
                                            width={400}
                                            height={400}
                                            alt="Captured"
                                            className="rounded-lg"
                                        />
                                    ) : (
                                        <p className="text-red-500">No image captured</p>
                                    )
                                )}
                            </div>
                            
                            <div>
                                <label htmlFor="camera-select" className="block text-sm font-medium mb-2">Camera</label>
                                <select
                                    id="camera-select"
                                    value={selectedDevice}
                                    onChange={handleDeviceChange}
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {videoDevices.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || 'Camera'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter your name"
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                
                            <div>
                                <label htmlFor="group" className="block text-sm font-medium mb-2">Group</label>
                                <input
                                    id="group"
                                    type="text"
                                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter your class"
                                    onChange={e => setGroup(e.target.value)}
                                    required
                                />
                            </div>
                    
                            <div className="flex justify-center space-x-4">
                                {!isImageCaptured && (
                                    <button
                                        type="button"
                                        onClick={capture}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Capture
                                    </button>
                                )}
                                {isImageCaptured && (
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
