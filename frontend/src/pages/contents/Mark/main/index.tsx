import { useEffect, useRef, useState } from "react";
import React from 'react';
import Webcam from "react-webcam";
import Swal from 'sweetalert2';


const Mark: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [capturing, setCapturing] = useState(false);
    // const [prompt, setPrompt] = useState('');
    const [warning, setWarning] = useState(false);
    const [cooldownEndTime, setCooldownEndTime] = useState<number>(0);
    const [remainingTime, setRemainingTime] = useState<number | null>(null);

    useEffect(() => {
        if (cooldownEndTime > Date.now()) {
            const intervalId = setInterval(() => {
                const newRemainingTime = Math.ceil((cooldownEndTime - Date.now()) / 1000);
                if (newRemainingTime > 0) {
                    setRemainingTime(newRemainingTime);
                } else {
                    clearInterval(intervalId);
                    setRemainingTime(null);
                    setWarning(false);
                }
            }, 1000);
            return () => clearInterval(intervalId);
        }
    }, [cooldownEndTime]);


    const capture = async () => {
        setCapturing(true);
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                try {
                    const base64Response = await fetch(imageSrc);
                    const blob = await base64Response.blob();

                    const formData = new FormData();
                    formData.append('image_data', blob, 'image.jpg');

                    const recognizeResponse = await fetch('/api/contents/mark', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'recognize',
                            imageData: imageSrc
                        })
                    });

                    const recognizeData = await recognizeResponse.json();

                    if (recognizeData.status === "failed") {
                        // setWarning(true);
                        const nextAllowedAttempt = new Date(recognizeData.nextAllowedAttempt);
                        setCooldownEndTime(nextAllowedAttempt.getTime());
                        Swal.fire('Attendance Canceled', recognizeData.name, 'warning');
                    } else if (recognizeData.name === "Unknown") {
                        Swal.fire('Unknown User', 'Face not recognized', 'error');
                    } else if (recognizeData.message === "No face detected") {
                        Swal.fire('Error', 'No face detected', 'error');
                    } else if (recognizeData.message === "More than one face detected") {
                        Swal.fire('Error', 'Multiple faces detected', 'error');
                    }else if (recognizeData.message === "Liveness detection failed"){
                        Swal.fire('Error', 'Liveness detection failed. Please don&apos;t use counterfeit face image.', 'error');
                    } else {
                        const markResponse = await fetch('/api/contents/mark', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: 'mark',
                                name: recognizeData.name,
                                group: recognizeData.group,
                                imageData: imageSrc // Your base64 encoded image
                            })
                        });

                        const markData = await markResponse.json();

                        if (markData.status === "success") {
                            Swal.fire('Success', `Attendance marked for ${recognizeData.name} (${recognizeData.group})`, 'success');
                        } else {
                            Swal.fire('Error', markData.message || 'Failed to mark attendance', 'error');
                        }
                    }
                } catch (error) {
                    console.error('Error:', error);
                    Swal.fire('Error', 'An unexpected error occurred', 'error');
                }
            } else {
                Swal.fire('Error', 'Failed to capture image', 'error');
            }
        }
        setCapturing(false);
    };

    useEffect(() => {
        const getVideoDevices = async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevs = devices.filter(device => device.kind === 'videoinput');
            setVideoDevices(videoDevs);
            if (videoDevs.length > 0) {
                setSelectedDevice(videoDevs[0].deviceId);
            }
        };

        getVideoDevices();
    }, []);
    
    // const handleDeviceChange = (event) => {
    //     setSelectedDevice(event.target.value);
    // };

    return (
        <div className="h-[85vh] max-w-full bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 text-white p-6">
            <div className="flex flex-col items-center p-4">
                <h1 className="text-3xl font-bold mb-4">Mark Attendance</h1>
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%"
                        height="100%"
                        videoConstraints={{ deviceId: selectedDevice }}
                        className="w-full h-auto mb-4"
                    />
                    {capturing && <p className="text-center mb-2">Processing...</p>}
                    <div className="mb-4">
                        <label htmlFor="camera-select" className="block mb-2 dark:text-gray-300 text-gray-800">Select Camera:</label>
                        <select
                            id="camera-select"
                            value={selectedDevice}
                            onChange={(e) => setSelectedDevice(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 bg-slate-50 text-slate-800 dark:text-slate-300"
                        >
                            {videoDevices.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${device.deviceId}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={capture}
                        disabled={capturing || warning}
                        className={`w-full py-2 px-4 rounded ${
                            capturing || warning
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {capturing ? 'Processing...' : 'Mark Attendance'}
                    </button>
                    {warning && remainingTime !== null && (
                        <p className="text-red-500 mt-2">
                            Please try again in {Math.floor(remainingTime / 60)}:
                            {(remainingTime % 60).toString().padStart(2, '0')} minutes.
                        </p>
                    )}
                    {/* {prompt && <p className="text-center mt-2">{prompt}</p>} */}
                </div>
            </div>
        </div>
    );
};

export default Mark;