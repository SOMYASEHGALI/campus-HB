import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Typography, Form, Input, message, Divider, Tag, Space, Breadcrumb, Progress } from 'antd';
import { ArrowLeftOutlined, SendOutlined, LinkOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, ProjectOutlined, BankOutlined, FileTextOutlined, PaperClipOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { ExperimentOutlined, CloudUploadOutlined, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getApiUrl } from '../config/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text, Paragraph } = Typography;

const ApplyJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [isKeyVerified, setIsKeyVerified] = useState(false);
    const [bulkKey, setBulkKey] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(-1);
    const [submissionType, setSubmissionType] = useState('link'); // 'link' or 'file'
    const [cvFile, setCvFile] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    const sheetInputRef = React.useRef(null);
    const resumeInputRef = React.useRef(null);

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(getApiUrl(`jobs/${id}`), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJob(res.data);
            setLoading(false);
        } catch (err) {
            message.error('Job details not found');
            navigate('/');
        }
    };

    const onFinish = async (values) => {
        if (submissionType === 'file' && !cvFile) {
            return message.error('Please upload your CV file');
        }
        if (submissionType === 'link' && !values.resumeUrl) {
            return message.error('Please provide your resume link');
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('jobId', id);
            formData.append('studentName', values.studentName);
            formData.append('email', values.email);
            formData.append('phone', values.phone);
            formData.append('rollNumber', values.rollNumber || '');

            if (submissionType === 'link' && values.resumeUrl) {
                formData.append('resumeUrl', values.resumeUrl);
            } else if (submissionType === 'file' && cvFile) {
                formData.append('resume', cvFile);
            }

            await axios.post(getApiUrl('applications/submit'), formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            message.success('Student application submitted successfully!');
            form.resetFields();
            setCvFile(null);
        } catch (err) {
            message.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const files = Array.from(e.target.files);
        if (!files || files.length === 0) return;

        if (type !== 'Resumes') {
            message.info('Spreadsheet parsing is currently manual. Please use PDF uploads for automatic processing.');
            return;
        }

        setIsUploading(true);
        setUploadQueue(files.map(f => ({ name: f.name, status: 'pending' })));
        setUploadProgress(0);

        const token = localStorage.getItem('token');
        let completedCount = 0;

        for (let i = 0; i < files.length; i++) {
            setCurrentFileIndex(i);
            const file = files[i];

            // Individual Toast for each file start
            const toastId = toast.info(`Starting upload: ${file.name}`, { autoClose: 2000 });

            try {
                const formData = new FormData();
                formData.append('jobId', id);
                formData.append('resume', file);

                await axios.post(getApiUrl('applications/upload-single-cv'), formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                completedCount++;
                setUploadProgress(Math.round((completedCount / files.length) * 100));

                // Success updates
                setUploadQueue(prev => {
                    const next = [...prev];
                    next[i].status = 'success';
                    return next;
                });

                toast.update(toastId, {
                    render: `Successfully saved: ${file.name}`,
                    type: "success",
                    autoClose: 3000
                });

            } catch (err) {
                setUploadQueue(prev => {
                    const next = [...prev];
                    next[i].status = 'error';
                    return next;
                });
                toast.update(toastId, {
                    render: `Failed: ${file.name}`,
                    type: "error",
                    autoClose: 3000
                });
            }
        }

        toast.success(`Broadcasting Complete: ${completedCount}/${files.length} records active.`, {
            position: "top-center",
            autoClose: 5000
        });

        setTimeout(() => {
            setIsUploading(false);
            setUploadQueue([]);
            setCurrentFileIndex(-1);
        }, 2000);

        e.target.value = '';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading enterprise data...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Breadcrumb
                    className="mb-8"
                    separator={<span className="text-slate-600">/</span>}
                    items={[
                        { title: <Link to="/" className="!text-slate-400 hover:!text-indigo-400">Dashboard</Link> },
                        { title: <span className="!text-slate-200">Application Portal</span> }
                    ]}
                />

                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="!text-slate-400 hover:!text-indigo-400 !font-semibold mb-6 flex items-center gap-2 p-0"
                >
                    Back to Listings
                </Button>
            </motion.div>

            <div className="space-y-10">
                {/* Job Description Section - Top */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="!bg-slate-800/40 !border-white/5 !rounded-3xl border-l-4 !border-l-indigo-500 overflow-hidden shadow-2xl">
                        <div className="mb-8">
                            <Title level={2} className="!text-white !mb-2 !font-bold leading-tight">{job.title}</Title>
                            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                                <BankOutlined /> {job.company}
                            </div>
                            <div className="flex flex-wrap gap-6 py-6 border-y border-white/5">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Tag color="rgba(99, 102, 241, 0.1)" className="!text-indigo-400 !m-0">ACTIVE</Tag>
                                    <Text className="text-slate-500">• Posted {new Date(job.createdAt).toLocaleDateString()}</Text>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-indigo-400">
                                        <ProjectOutlined />
                                    </div>
                                    <div>
                                        <Text className="text-slate-500 block text-xs uppercase font-bold letter-spacing-widest">Experience</Text>
                                        <Text className="text-slate-200 font-medium">{job.experience || 'Not Specified'}</Text>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <Title level={5} className="!text-slate-300 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest font-black">Role Description</Title>
                                <Paragraph className="text-slate-400 leading-relaxed">{job.description}</Paragraph>
                            </div>

                            {job.skills && job.skills.length > 0 && (
                                <div>
                                    <Title level={5} className="!text-slate-300 mb-4 uppercase text-xs tracking-widest font-black">Required Frameworks</Title>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map(skill => (
                                            <Tag key={skill} className="!bg-indigo-500/10 !border-indigo-500/20 !text-indigo-300 !rounded-lg !m-0 px-3 py-1 text-sm font-medium">
                                                {skill}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Application Form Section - Bottom */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                    <Card className="!bg-slate-800/60 !border-white/5 !rounded-[2.5rem] p-4 sm:p-10 !backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 relative z-10">
                            <div>
                                <Title level={2} className="!text-white !m-0 !font-black !text-3xl">Candidate Intake</Title>
                                <Text className="text-slate-500 font-medium">Placement Cell: <span className="text-indigo-400 font-bold">{user.collegeName}</span></Text>
                            </div>
                            <div className="px-6 py-3 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <Text className="text-slate-300 font-bold text-sm tracking-wide">SYSTEM SECURE</Text>
                            </div>
                        </div>

                        {user.role === 'staff' ? (
                            <div className="relative z-10 py-10 text-center">
                                {!isKeyVerified ? (
                                    <div className="max-w-md mx-auto">
                                        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <ExperimentOutlined className="text-4xl text-amber-500" />
                                        </div>
                                        <Title level={3} className="!text-white mb-4">Staff Verification Required</Title>
                                        <Text className="text-slate-400 block mb-8 text-lg">
                                            Enter the <span className="text-amber-400 font-bold italic underline">HB-MASTER-KEY</span> to unlock bulk recruitment tools for <span className="text-white font-semibold">{job.company}</span>.
                                        </Text>

                                        <div className="space-y-6">
                                            <Input.Password
                                                placeholder="Enter Access Key"
                                                value={bulkKey}
                                                onChange={(e) => setBulkKey(e.target.value)}
                                                className="!h-16 !rounded-2xl text-center text-2xl tracking-[0.5em] !bg-slate-900/50 !border-white/10"
                                                onPressEnter={() => {
                                                    if (bulkKey === 'HBSTAFF2025') {
                                                        setIsKeyVerified(true);
                                                        message.success('Master Access Granted');
                                                    } else {
                                                        message.error('Invalid Credentials');
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="primary"
                                                size="large"
                                                block
                                                className="!h-16 !rounded-2xl font-bold text-lg !bg-amber-500 hover:!bg-amber-600 !border-none"
                                                onClick={() => {
                                                    if (bulkKey === 'HBSTAFF2025') {
                                                        setIsKeyVerified(true);
                                                        message.success('Master Access Granted');
                                                    } else {
                                                        message.error('Invalid Credentials');
                                                    }
                                                }}
                                            >
                                                Verify & Unlock Bulk Upload
                                            </Button>
                                            <Text className="text-slate-500 text-xs flex items-center justify-center gap-2">
                                                <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
                                                Single form submission is disabled for staff accounts
                                            </Text>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="max-w-2xl mx-auto"
                                    >
                                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                                            <SendOutlined className="text-4xl text-green-500" />
                                        </div>
                                        <Title level={3} className="!text-white mb-2">Master Upload Active</Title>
                                        <Tag color="green" className="mb-8 !rounded-full px-4">Ready for Bulk Data Transmission</Tag>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                            <input
                                                type="file"
                                                ref={sheetInputRef}
                                                style={{ display: 'none' }}
                                                accept=".csv, .xlsx, .xls"
                                                onChange={(e) => handleFileUpload(e, 'Database')}
                                            />
                                            <div className="glass-card p-6 !bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] hover:!bg-indigo-600/10 transition-all cursor-pointer group flex flex-col items-center">
                                                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
                                                    <FileTextOutlined className="text-xl text-indigo-400" />
                                                </div>
                                                <Title level={5} className="!text-white mb-2 group-hover:text-indigo-400">Database (CSV/XLSX)</Title>
                                                <Text className="text-slate-500 text-xs text-center mb-6">Bulk application processing via student records</Text>
                                                <Button
                                                    type="primary"
                                                    block
                                                    loading={isUploading}
                                                    className="!h-12 !rounded-xl !bg-indigo-600"
                                                    onClick={() => sheetInputRef.current.click()}
                                                >
                                                    Upload Sheet
                                                </Button>
                                            </div>

                                            <input
                                                type="file"
                                                ref={resumeInputRef}
                                                style={{ display: 'none' }}
                                                accept=".pdf, .docx, .doc"
                                                multiple
                                                onChange={(e) => handleFileUpload(e, 'Resumes')}
                                            />
                                            <div className="glass-card p-6 !bg-amber-600/5 border border-amber-500/20 rounded-[2rem] hover:!bg-amber-600/10 transition-all cursor-pointer group flex flex-col items-center">
                                                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                                                    <PaperClipOutlined className="text-xl text-amber-400" />
                                                </div>
                                                <Title level={5} className="!text-white mb-2 group-hover:text-amber-400">Resumes (PDF/DOCX)</Title>
                                                <Text className="text-slate-500 text-xs text-center mb-6">Mass upload of verified student portfolios</Text>
                                                <Button
                                                    type="primary"
                                                    block
                                                    loading={isUploading}
                                                    className="!h-12 !rounded-xl !bg-amber-600 !border-none"
                                                    onClick={() => resumeInputRef.current.click()}
                                                >
                                                    Upload Files
                                                </Button>
                                            </div>
                                        </div>

                                        {isUploading && (
                                            <div className="w-full mb-8 bg-black/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                                                <div className="flex justify-between items-center mb-6">
                                                    <div>
                                                        <Title level={4} className="!text-white !m-0 flex items-center gap-3">
                                                            <CloudUploadOutlined className="text-cyan-400 animate-pulse" />
                                                            Enterprise Uplink
                                                        </Title>
                                                        <Text className="text-slate-500 text-xs">Processing global residency requests</Text>
                                                    </div>
                                                    <div className="text-right">
                                                        <Text className="text-cyan-400 font-mono text-xl font-bold">{uploadProgress}%</Text>
                                                        <div className="text-[10px] text-slate-600 font-mono uppercase tracking-tighter">Throughput Optimized</div>
                                                    </div>
                                                </div>

                                                <Progress
                                                    percent={uploadProgress}
                                                    status="active"
                                                    strokeColor={{ '0%': '#06b6d4', '100%': '#6366f1' }}
                                                    trailColor="rgba(255,255,255,0.03)"
                                                    strokeWidth={12}
                                                    showInfo={false}
                                                    className="mb-8"
                                                />

                                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar font-mono">
                                                    {uploadQueue.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${idx === currentFileIndex ? 'bg-cyan-500/10 border-cyan-500/30' :
                                                                item.status === 'success' ? 'bg-green-500/5 border-green-500/10 opacity-60' :
                                                                    'bg-white/5 border-white/5 opacity-40'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3 truncate max-w-[70%]">
                                                                {item.status === 'pending' && <LoadingOutlined className="text-slate-500" />}
                                                                {item.status === 'success' && <CheckCircleOutlined className="text-green-500" />}
                                                                {item.status === 'error' && <CloseCircleOutlined className="text-red-500" />}
                                                                <Text className="text-slate-300 text-xs truncate">{item.name}</Text>
                                                            </div>
                                                            <Text className={`text-[10px] font-bold ${idx === currentFileIndex ? 'text-cyan-400' :
                                                                item.status === 'success' ? 'text-green-500' : 'text-slate-600'
                                                                }`}>
                                                                {idx === currentFileIndex ? 'UPLOADING...' : item.status.toUpperCase()}
                                                            </Text>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            type="text"
                                            className="!text-slate-500 hover:!text-slate-300 !mt-4"
                                            onClick={() => {
                                                setIsKeyVerified(false);
                                                setBulkKey('');
                                            }}
                                        >
                                            Lock Session & Logout
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                requiredMark={false}
                                className="relative z-10"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    <Form.Item name="studentName" label={<span className="text-slate-300 font-bold">Full Legal Name</span>} rules={[{ required: true }]}>
                                        <Input prefix={<UserOutlined className="text-slate-500 mr-2" />} placeholder="e.g. Rahul Sharma" className="!h-14 !rounded-2xl" />
                                    </Form.Item>

                                    <Form.Item name="email" label={<span className="text-slate-300 font-bold">University Email</span>} rules={[{ required: true, type: 'email' }]}>
                                        <Input prefix={<MailOutlined className="text-slate-500 mr-2" />} placeholder="rahul@college.edu" className="!h-14 !rounded-2xl" />
                                    </Form.Item>

                                    <Form.Item name="phone" label={<span className="text-slate-300 font-bold">Mobile Connectivity</span>} rules={[{ required: true }]}>
                                        <Input prefix={<PhoneOutlined className="text-slate-500 mr-2" />} placeholder="+91 98765-43210" className="!h-14 !rounded-2xl" />
                                    </Form.Item>

                                    <Form.Item name="rollNumber" label={<span className="text-slate-300 font-bold">Institutional UID / Roll No</span>}>
                                        <Input prefix={<IdcardOutlined className="text-slate-500 mr-2" />} placeholder="CS-2024-512" className="!h-14 !rounded-2xl" />
                                    </Form.Item>
                                </div>

                                <div className="mb-8">
                                    <div className="flex gap-4 mb-6 p-1 bg-slate-900/50 rounded-2xl border border-white/5 w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setSubmissionType('link')}
                                            className={`px-6 py-2 rounded-xl transition-all font-bold text-sm ${submissionType === 'link' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Drive Link
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSubmissionType('file')}
                                            className={`px-6 py-2 rounded-xl transition-all font-bold text-sm ${submissionType === 'file' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Upload PDF/CV
                                        </button>
                                    </div>

                                    {submissionType === 'link' ? (
                                        <Form.Item
                                            name="resumeUrl"
                                            label={<span className="text-slate-300 font-bold">Verified Portfolio/Resume Link</span>}
                                            rules={[{ required: submissionType === 'link', type: 'url', message: 'Please enter a valid URL' }]}
                                            extra={<Text className="text-slate-500 text-xs italic">Ensure link permissions are set to "Anyone with the link can view"</Text>}
                                        >
                                            <Input prefix={<LinkOutlined className="text-indigo-500 mr-2" />} placeholder="https://drive.google.com/your-resume-link" className="!h-14 !rounded-2xl !border-indigo-500/30" />
                                        </Form.Item>
                                    ) : (
                                        <div className="space-y-4">
                                            <Text className="text-slate-300 font-bold block mb-2">Upload Professional CV (PDF Only)</Text>
                                            <div
                                                onClick={() => !cvFile && resumeInputRef.current?.click()}
                                                className={`h-32 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer ${cvFile ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-indigo-500/30 bg-slate-900/30'}`}
                                            >
                                                <input
                                                    type="file"
                                                    ref={resumeInputRef}
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => setCvFile(e.target.files[0])}
                                                />
                                                {cvFile ? (
                                                    <div className="flex flex-col items-center">
                                                        <CheckCircleOutlined className="text-2xl text-green-500 mb-2" />
                                                        <Text className="text-white font-medium">{cvFile.name}</Text>
                                                        <Button type="link" danger onClick={(e) => { e.stopPropagation(); setCvFile(null); }}>Remove File</Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <CloudUploadOutlined className="text-3xl text-slate-600 mb-2" />
                                                        <Text className="text-slate-500">Click to select or drag and drop CV file</Text>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Divider className="!border-white/5 my-10" />

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submitting}
                                    block
                                    className="!h-16 !rounded-2xl font-black text-xl shadow-2xl flex items-center justify-center gap-3 group overflow-hidden"
                                >
                                    <span className="group-hover:translate-x-1 transition-transform">Authorize Contribution</span>
                                    <SendOutlined className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Form>
                        )}
                    </Card>
                    <ToastContainer theme="dark" position="bottom-right" />
                </motion.div>
            </div>
        </div>
    );
};

export default ApplyJob;
