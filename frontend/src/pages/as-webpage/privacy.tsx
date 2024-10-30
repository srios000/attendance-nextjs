import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const PrivacyPolicy: NextPage = () => {
	const [lastUpdated, setLastUpdated] = useState('');
	const [fadeIn, setFadeIn] = useState(false);

	useEffect(() => {
		setFadeIn(true);
		fetch('/api/contents/lastUpdated/privacy')
			.then(response => response.json())
			.then(data => setLastUpdated(data.lastUpdated));
	}, []);

	return (
		<div className={`container dark:bg-slate-900 h-full overflow-y-scroll mx-auto p-6 bg-white ${fadeIn ? 'animate-fadeIn' : ''}`}>
			<Head>
				<title>Privacy Policy - Attendance App Integration</title>
				<meta name="description" content="Read our Privacy Policy to understand how we handle your data" />
			</Head>

			<style jsx global>{`
				.animate-fadeIn {
					animation: fadeIn 0.3s ease-in-out;
				}
				.container::-webkit-scrollbar {
					width: 0;
					height: 0;
				}
				.container {
					-ms-overflow-style: none;
					scrollbar-width: none;
					text-align: justify;
				}
				@keyframes fadeIn {
					from { opacity: 0; }
					to { opacity: 1; }
				}
			`}</style>

			<main className="text-gray-800 select-none">
				<h1 className="text-3xl font-extrabold mb-6 dark:text-slate-100 text-slate-700 transition duration-300 ease-in-out hover:text-slate-800">Privacy Policy</h1>
				<p className="text-sm italic mb-4 dark:text-slate-100">Last Updated: {lastUpdated || '[Loading...]'}</p>

				<p className="leading-relaxed dark:text-slate-100 mb-6">Welcome to Attendance App Integration. We are committed to safeguarding your privacy. This Privacy Policy explains what information we collect, how we use it, and the steps we take to protect it.</p>

				<section className="mb-12 dark:text-slate-100 animate-fadeIn delay-200ms">
					<h2 className="text-2xl dark:text-slate-100 font-semibold mb-4 text-slate-600">Information Collection and Use</h2>
					<ol>
						<li>
							<p>
								test
							</p>
						</li>
						<li>
							<p>
								test
							</p>
						</li>
					</ol>
				</section>			
				<section className="mb-12 dark:text-slate-100 animate-fadeIn delay-600ms">
					<h2 className="text-2xl dark:text-slate-100 font-semibold mb-4 text-slate-600">Data Security</h2>
					<ol>
						<li>
							<p>
								<strong>Data Protection</strong>: We implement robust security measures to protect your personal information from unauthorized access, alteration, or destruction.
							</p>
						</li>
						<li>
							<p>
								<strong>Data Encryption</strong>: Sensitive data transmitted between your device and our servers is protected using encryption technologies.
							</p>
						</li>
						<li>
							<p>
								<strong>Updates and Maintenance</strong>: We are dedicated to keeping our platform secure and regularly update our systems to incorporate the latest security measures.
							</p>
						</li>
					</ol>
				</section>
				<section className="mb-12 dark:text-slate-100 animate-fadeIn delay-600ms">
					<p className="text-lg dark:text-slate-100 font-semibold mb-4">By using Attendance App Integration, you acknowledge and agree to the terms outlined in this Privacy Policy. We reserve the right to update this policy as necessary to reflect changes in our practices or legal requirements.</p>
				</section>

				{/* Additional sections for third-party services, user rights, etc. can be added here */}
				<Link href="/" passHref>
					<span className="inline-block bg-gray-400 dark:text-slate-100 dark:bg-gray-700 dark:hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-500 transition duration-300">
						Go Back to Home
					</span>
				</Link>
			</main>
		</div>
	);
};

export default PrivacyPolicy;
