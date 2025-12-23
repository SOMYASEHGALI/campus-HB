import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Typography, Form, Input, message, Divider, Tag, Space, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, SendOutlined, LinkOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, ProjectOutlined, BankOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const ApplyJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/jobs/${id}`, {
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
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/applications/submit', {
                ...values,
                jobId: id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Student application submitted successfully!');
            form.resetFields();
        } catch (err) {
            message.error('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading enterprise data...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Breadcrumb className="mb-8" separator={<span className="text-slate-600">/</span>}>
                    <Breadcrumb.Item><Link to="/" className="!text-slate-400 hover:!text-indigo-400">Dashboard</Link></Breadcrumb.Item>
                    <Breadcrumb.Item className="!text-slate-200">Application Portal</Breadcrumb.Item>
                </Breadcrumb>

                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="!text-slate-400 hover:!text-indigo-400 !font-semibold mb-6 flex items-center gap-2 p-0"
                >
                    Back to Listings
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-1">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="!bg-slate-800/40 !border-white/5 !rounded-3xl border-l-4 !border-l-indigo-500 overflow-hidden shadow-2xl">
                            <div className="mb-8">
                                <Title level={2} className="!text-white !mb-2 !font-bold leading-tight">{job.title}</Title>
                                <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                                    <BankOutlined /> {job.company}
                                </div>
                                <div className="space-y-4 py-6 border-y border-white/5">
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

                            <div className="space-y-8">
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
                </div>

                <div className="xl:col-span-2">
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

                                <Form.Item
                                    name="resumeUrl"
                                    label={<span className="text-slate-300 font-bold">Verified Portfolio/Resume Link</span>}
                                    rules={[{ required: true, type: 'url', message: 'Please enter a valid URL' }]}
                                    extra={<Text className="text-slate-500 text-xs italic">Ensure link permissions are set to "Anyone with the link can view"</Text>}
                                >
                                    <Input prefix={<LinkOutlined className="text-indigo-500 mr-2" />} placeholder="https://drive.google.com/your-resume-link" className="!h-14 !rounded-2xl !border-indigo-500/30" />
                                </Form.Item>

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
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ApplyJob;
