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
import { ThreeBackground } from '../components/ThreeBackground';
import '../styles/modern-form.css';

const { Title, Text, Paragraph } = Typography;

// Drag & Drop File Uploader Component
const DragDropUploader = ({ cvFile, cvUploading, studentCvInputRef, handleStudentCvUpload, setCvFile }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];

            // Validate file type
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                toast.error('Please upload only PDF, DOC, or DOCX files');
                return;
            }

            // Create a synthetic event to pass to handleStudentCvUpload
            const syntheticEvent = {
                target: {
                    files: [file],
                    value: ''
                }
            };
            handleStudentCvUpload(syntheticEvent);
        }
    };

    return (
        <div className="modern-card-section p-8">
            <label className="modern-label !mb-6">Upload Your Resume</label>

            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !cvFile && !cvUploading && studentCvInputRef.current?.click()}
                className={`modern-upload-area ${isDragging ? 'dragging' : ''}`}
            >
                <input
                    type="file"
                    ref={studentCvInputRef}
                    className="absolute opacity-0 w-0 h-0 pointer-events-none"
                    accept=".pdf,.doc,.docx"
                    onChange={handleStudentCvUpload}
                    tabIndex={-1}
                    style={{ position: 'absolute', left: '-9999px' }}
                />

                <AnimatePresence mode="wait">
                    {cvUploading ? (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                                    <LoadingOutlined className="text-4xl text-cyan-400 animate-spin" />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
                            </div>
                            <Text className="text-cyan-400 font-semibold text-lg">Uploading...</Text>
                            <Text className="text-slate-500 text-sm mt-1">Please wait</Text>
                        </motion.div>
                    ) : cvFile ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center w-full px-6"
                        >
                            <div className="relative mb-4">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircleOutlined className="text-4xl text-green-400" />
                                </div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 rounded-full border-2 border-green-500/30"
                                ></motion.div>
                            </div>
                            <Text className="text-gray-900 font-semibold text-lg mb-1">File Ready!</Text>
                            <Text className="text-gray-600 text-sm mb-4 truncate max-w-full">{cvFile.name}</Text>
                            <div className="flex gap-3">
                                <Button
                                    type="primary"
                                    size="small"
                                    className="!bg-green-600 !border-none !rounded-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // File is ready, no action needed
                                    }}
                                >
                                    ✓ Selected
                                </Button>
                                <Button
                                    danger
                                    size="small"
                                    className="!rounded-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCvFile(null);
                                        toast.info('📄 File removed. You can upload a new one.');
                                    }}
                                >
                                    Remove
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center"
                        >
                            <motion.div
                                animate={{
                                    y: isDragging ? -10 : [0, -8, 0],
                                }}
                                transition={{
                                    duration: isDragging ? 0.3 : 2,
                                    repeat: isDragging ? 0 : Infinity,
                                    ease: "easeInOut"
                                }}
                                className="mb-4"
                            >
                                <div className={`modern-icon-container ${isDragging ? 'scale-110 shadow-xl' : ''}`}>
                                    <CloudUploadOutlined />
                                </div>
                            </motion.div>
                            <h4 className="modern-upload-text !mt-4">
                                {isDragging ? 'Drop your file here' : 'Drag & drop your CV'}
                            </h4>
                            <p className="modern-upload-subtext">or click to browse</p>
                            <div className="flex gap-2 mt-4">
                                <span className="modern-tag">PDF</span>
                                <span className="modern-tag">DOC</span>
                                <span className="modern-tag">DOCX</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Animated border effect when dragging */}
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-2xl border-2 border-indigo-500 pointer-events-none"
                        style={{
                            background: 'linear-gradient(45deg, transparent 30%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
                            backgroundSize: '200% 200%',
                            animation: 'gradient 2s ease infinite'
                        }}
                    ></motion.div>
                )}
            </div>

            <Text className="text-gray-500 text-xs font-bold mt-3 block text-center uppercase tracking-wider">
                Maximum file size: 10MB
            </Text>
        </div >
    );
};


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
    const [cvUploading, setCvUploading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    const sheetInputRef = React.useRef(null);
    const resumeInputRef = React.useRef(null); // For staff bulk uploads
    const studentCvInputRef = React.useRef(null); // For student single CV upload

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

    const handleStudentCvUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload only PDF, DOC, or DOCX files');
            e.target.value = '';
            return;
        }

        setCvUploading(true);
        const toastId = toast.info(`📄 Uploading: ${file.name}...`, { autoClose: false });

        try {
            // Simulate upload progress (you can replace this with actual upload progress)
            await new Promise(resolve => setTimeout(resolve, 500));

            setCvFile(file);
            toast.update(toastId, {
                render: `✅ ${file.name} ready for submission`,
                type: 'success',
                autoClose: 3000
            });
        } catch (err) {
            toast.update(toastId, {
                render: `❌ Upload failed: ${file.name}`,
                type: 'error',
                autoClose: 3000
            });
        } finally {
            setCvUploading(false);
            e.target.value = ''; // Reset input to allow re-selection of same file
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

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600 bg-gray-50">Loading job details...</div>;

    return (
        <>
            <ThreeBackground />
            <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen relative z-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Breadcrumb
                        className="mb-8 modern-breadcrumb"
                        separator={<span className="text-gray-600 font-bold">/</span>}
                        items={[
                            { title: <Link to="/" className="hover:!text-blue-600">Dashboard</Link> },
                            { title: <span className="modern-breadcrumb-active">Application Portal</span> }
                        ]}
                    />

                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        className="modern-back-button mb-6 flex items-center gap-2 p-0"
                    >
                        Back to Listings
                    </Button>
                </motion.div>

                <div className="space-y-10">
                    {/* Job Description Section - Top */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="modern-job-card overflow-hidden">
                            <div className="mb-8">
                                <Title level={1} className="modern-job-title">{job.title}</Title>
                                <div className="flex items-center gap-2 modern-company-name mb-4">
                                    <BankOutlined /> {job.company}
                                </div>
                                <div className="flex flex-wrap gap-6 py-6 border-y border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <span className="modern-status-badge">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            ACTIVE
                                        </span>
                                        <Text className="text-gray-900 font-bold">• Posted {new Date(job.createdAt).toLocaleDateString()}</Text>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="modern-icon-container">
                                            <ProjectOutlined />
                                        </div>
                                        <div>
                                            <Text className="text-gray-950 block text-xs uppercase font-black tracking-widest">Experience</Text>
                                            <Text className="text-gray-900 font-bold text-lg">{job.experience || 'Not Specified'}</Text>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <Title level={5} className="!text-gray-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-wide font-black">Role Description</Title>
                                    <Paragraph className="text-gray-900 leading-relaxed font-medium">{job.description}</Paragraph>
                                </div>

                                {job.skills && job.skills.length > 0 && (
                                    <div>
                                        <Title level={5} className="!text-gray-900 mb-4 uppercase text-xs tracking-wide font-black">Required Skills</Title>
                                        <div className="flex flex-wrap gap-2">
                                            {job.skills.map(skill => (
                                                <Tag key={skill} className="!bg-blue-50 !border-blue-200 !text-blue-700 !rounded-lg !m-0 px-3 py-1 text-sm font-medium">
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
                        <Card className="modern-form-container p-4 sm:p-10 relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 relative z-10">
                                <div>
                                    <h2 className="modern-section-header">Application Form</h2>
                                    <p className="modern-section-subtitle">Placement Cell: <span className="text-blue-600 font-bold">{user.collegeName}</span></p>
                                </div>
                                <div className="modern-status-badge">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    SECURE CONNECTION
                                </div>
                            </div>

                            {user.role === 'staff' ? (
                                <div className="relative z-10 py-10 text-center">
                                    {!isKeyVerified ? (
                                        <div className="max-w-md mx-auto">
                                            <div className="modern-icon-container mx-auto mb-8 !w-20 !h-20" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                                                <ExperimentOutlined className="!text-4xl" />
                                            </div>
                                            <h3 className="modern-section-header !text-2xl text-center">Staff Verification</h3>
                                            <p className="modern-section-subtitle text-center mb-8">
                                                Enter the <span className="text-amber-600 font-bold italic underline">HB-MASTER-KEY</span> to unlock bulk recruitment tools for <span className="text-gray-900 font-bold">{job.company}</span>.
                                            </p>

                                            <div className="space-y-6">
                                                <Input.Password
                                                    placeholder="Enter Access Key"
                                                    value={bulkKey}
                                                    onChange={(e) => setBulkKey(e.target.value)}
                                                    className="modern-input !h-20 text-center !text-3xl tracking-[0.5em]"
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
                                                    block
                                                    className="modern-submit-button !h-16 !bg-amber-500 hover:!bg-amber-600"
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
                                            className="max-w-4xl mx-auto"
                                        >
                                            <div className="modern-status-badge !px-8 !py-4 !bg-green-100 !text-green-800 !border-green-300 flex items-center justify-center mx-auto mb-8 w-fit">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                                MASTER UPLOAD ACTIVE
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                                <input
                                                    type="file"
                                                    ref={sheetInputRef}
                                                    style={{ display: 'none' }}
                                                    accept=".csv, .xlsx, .xls"
                                                    onChange={(e) => handleFileUpload(e, 'Database')}
                                                />
                                                <div className="modern-card-section hover:border-blue-500 transition-all cursor-pointer group flex flex-col items-center !mb-0">
                                                    <div className="modern-icon-container mb-4">
                                                        <FileTextOutlined />
                                                    </div>
                                                    <h4 className="modern-section-header !text-lg !text-center group-hover:text-blue-600">Database (CSV/XLSX)</h4>
                                                    <p className="modern-section-subtitle text-center mb-6">Bulk application processing via student records</p>
                                                    <Button
                                                        type="primary"
                                                        block
                                                        loading={isUploading}
                                                        className="modern-submit-button !h-12 !text-sm"
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
                                                <div className="modern-card-section hover:border-amber-500 transition-all cursor-pointer group flex flex-col items-center !mb-0">
                                                    <div className="modern-icon-container mb-4" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                                                        <PaperClipOutlined />
                                                    </div>
                                                    <h4 className="modern-section-header !text-lg !text-center group-hover:text-amber-600">Resumes (PDF/DOCX)</h4>
                                                    <p className="modern-section-subtitle text-center mb-6">Mass upload of verified student portfolios</p>
                                                    <Button
                                                        type="primary"
                                                        block
                                                        loading={isUploading}
                                                        className="modern-submit-button !h-12 !text-sm !bg-amber-500 hover:!bg-amber-600"
                                                        onClick={() => resumeInputRef.current.click()}
                                                    >
                                                        Upload Files
                                                    </Button>
                                                </div>
                                            </div>

                                            {isUploading && (
                                                <div className="w-full mb-8 bg-white border-2 border-blue-100 p-8 rounded-[2rem] shadow-xl">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <div>
                                                            <Title level={4} className="!text-gray-900 !m-0 !font-bold flex items-center gap-3">
                                                                <CloudUploadOutlined className="text-blue-600 animate-pulse" />
                                                                Enterprise Uplink
                                                            </Title>
                                                            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">Active Processing Channel</Text>
                                                        </div>
                                                        <div className="text-right">
                                                            <Text className="text-blue-600 font-mono text-2xl font-black">{uploadProgress}%</Text>
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Throughput Optimized</div>
                                                        </div>
                                                    </div>

                                                    <Progress
                                                        percent={uploadProgress}
                                                        status="active"
                                                        strokeColor={{ '0%': '#2563eb', '100%': '#3b82f6' }}
                                                        trailColor="#f1f5f9"
                                                        strokeWidth={12}
                                                        showInfo={false}
                                                        className="mb-8"
                                                    />

                                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                        {uploadQueue.map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${idx === currentFileIndex ? 'bg-blue-50 border-blue-200' :
                                                                    item.status === 'success' ? 'bg-green-50 border-green-100 opacity-60' :
                                                                        'bg-gray-50 border-gray-100 opacity-40'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3 truncate max-w-[70%]">
                                                                    {item.status === 'pending' && <LoadingOutlined className="text-blue-500" />}
                                                                    {item.status === 'success' && <CheckCircleOutlined className="text-green-500" />}
                                                                    {item.status === 'error' && <CloseCircleOutlined className="text-red-500" />}
                                                                    <Text className="text-gray-900 text-xs font-bold truncate">{item.name}</Text>
                                                                </div>
                                                                <Text className={`text-[10px] font-black ${idx === currentFileIndex ? 'text-blue-600' :
                                                                    item.status === 'success' ? 'text-green-600' : 'text-gray-400'
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
                                    {/* Personal Information Section */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-10"
                                    >
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="modern-icon-container">
                                                <UserOutlined />
                                            </div>
                                            <div>
                                                <h3 className="modern-section-header !text-xl !mb-0">Personal Information</h3>
                                                <p className="modern-section-subtitle">Enter your basic details</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 modern-card-section">
                                            <Form.Item
                                                name="studentName"
                                                label={<span className="modern-label">Full Legal Name</span>}
                                                rules={[{ required: true, message: 'Please enter your full name' }]}
                                            >
                                                <Input
                                                    prefix={<UserOutlined className="text-blue-600 mr-2" />}
                                                    placeholder="e.g. Rahul Sharma"
                                                    className="modern-input"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="email"
                                                label={<span className="modern-label">University Email</span>}
                                                rules={[
                                                    { required: true, message: 'Please enter your email' },
                                                    { type: 'email', message: 'Please enter a valid email' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<MailOutlined className="text-blue-600 mr-2" />}
                                                    placeholder="rahul@college.edu"
                                                    className="modern-input"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="phone"
                                                label={<span className="modern-label">Mobile Number</span>}
                                                rules={[{ required: true, message: 'Please enter your phone number' }]}
                                            >
                                                <Input
                                                    prefix={<PhoneOutlined className="text-blue-600 mr-2" />}
                                                    placeholder="+91 98765-43210"
                                                    className="modern-input"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name="rollNumber"
                                                label={<span className="modern-label">Roll Number / Student ID</span>}
                                            >
                                                <Input
                                                    prefix={<IdcardOutlined className="text-blue-600 mr-2" />}
                                                    placeholder="CS-2024-512"
                                                    className="modern-input"
                                                />
                                            </Form.Item>
                                        </div>
                                    </motion.div>

                                    {/* Resume Upload Section */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="mb-10"
                                    >
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="modern-icon-container" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
                                                <FileTextOutlined />
                                            </div>
                                            <div>
                                                <h3 className="modern-section-header !text-xl !mb-0">Resume / CV</h3>
                                                <p className="modern-section-subtitle">Choose how you want to submit your resume</p>
                                            </div>
                                        </div>

                                        {/* Toggle Buttons */}
                                        <div className="flex gap-4 mb-8 p-2 bg-gray-100 rounded-2xl w-fit">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSubmissionType('link');
                                                    setCvFile(null);
                                                }}
                                                className={`modern-toggle-button ${submissionType === 'link' ? 'active' : ''}`}
                                            >
                                                <LinkOutlined className="mr-2" />
                                                Drive Link
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSubmissionType('file');
                                                    form.setFieldsValue({ resumeUrl: undefined });
                                                }}
                                                className={`modern-toggle-button ${submissionType === 'file' ? 'active' : ''}`}
                                            >
                                                <CloudUploadOutlined className="mr-2" />
                                                Upload File
                                            </button>
                                        </div>

                                        {/* Content Based on Selection */}
                                        <AnimatePresence mode="wait">
                                            {submissionType === 'link' ? (
                                                <motion.div
                                                    key="link"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Form.Item
                                                        name="resumeUrl"
                                                        rules={[
                                                            { required: submissionType === 'link', message: 'Please enter your resume link' },
                                                            { type: 'url', message: 'Please enter a valid URL' }
                                                        ]}
                                                    >
                                                        <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                            <label className="modern-label !mb-4">Resume Drive Link</label>
                                                            <Input
                                                                prefix={<LinkOutlined className="text-blue-600 mr-2" />}
                                                                placeholder="https://drive.google.com/your-resume-link"
                                                                className="modern-input"
                                                            />
                                                            <p className="text-blue-700 text-sm font-black mt-4 flex items-center gap-2 italic">
                                                                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                                                                💡 Make sure your link is publicly accessible
                                                            </p>
                                                        </div>
                                                    </Form.Item>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="file"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <DragDropUploader
                                                        cvFile={cvFile}
                                                        cvUploading={cvUploading}
                                                        studentCvInputRef={studentCvInputRef}
                                                        handleStudentCvUpload={handleStudentCvUpload}
                                                        setCvFile={setCvFile}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    {/* Submit Button */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Divider className="!border-gray-200 my-8" />

                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={submitting}
                                            disabled={submissionType === 'file' && !cvFile}
                                            block
                                            className="modern-submit-button group relative overflow-hidden"
                                        >
                                            <span className="relative flex items-center justify-center gap-3">
                                                <SendOutlined className="text-xl group-hover:rotate-12 transition-transform" />
                                                Submit Application
                                            </span>
                                        </Button>

                                        <Text className="text-gray-900 font-bold text-xs text-center block mt-4 uppercase tracking-tight">
                                            🔒 Your information is secure and will only be shared with the hiring team
                                        </Text>
                                    </motion.div>
                                </Form>
                            )}
                        </Card>
                        <ToastContainer theme="light" position="bottom-right" />
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default ApplyJob;

