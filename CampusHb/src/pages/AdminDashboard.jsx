import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message, Card, Table, Tag, Space, Modal, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, RocketOutlined, GlobalOutlined, DollarOutlined, ExperimentOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
        } catch (err) {
            message.error('Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    const handlePostJob = async (values) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/jobs', {
                ...values,
                skills: values.skills ? values.skills.split(',').map(s => s.trim()) : []
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Job opening published successfully!');
            form.resetFields();
            setIsModalOpen(false);
            fetchJobs();
        } catch (err) {
            message.error('Failed to post job');
        }
    };

    const handleExport = (jobId) => {
        const token = localStorage.getItem('token');
        // Standard procedure for download with auth
        window.open(`http://localhost:5000/api/applications/export/${jobId}?token=${token}`, '_blank');
    };

    const columns = [
        {
            title: 'Job Opening',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="py-2">
                    <Text className="!text-white !font-bold block text-lg">{text}</Text>
                    <Text className="text-slate-500 text-sm">{record.company}</Text>
                </div>
            )
        },
        {
            title: 'Details',
            key: 'details',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text className="text-slate-400 text-xs flex items-center gap-1"><GlobalOutlined /> {record.location}</Text>
                    <Text className="text-slate-400 text-xs flex items-center gap-1"><DollarOutlined /> {record.salary}</Text>
                </Space>
            )
        },
        {
            title: 'Status',
            key: 'status',
            render: () => <Tag color="#10b981" className="!rounded-full px-3">Active</Tag>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Export Candidate Data">
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={() => handleExport(record._id)}
                            className="!bg-indigo-600/20 !text-indigo-400 !border-indigo-500/30 hover:!bg-indigo-600 hover:!text-white transition-all"
                        />
                    </Tooltip>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        className="!bg-red-500/10 !border-red-500/20 hover:!bg-red-500 hover:!text-white transition-all"
                    />
                </Space>
            )
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-slate-800/40 p-8 rounded-[2rem] border border-white/5"
            >
                <div>
                    <Title level={1} className="!text-white !m-0 !font-black !text-4xl">Command Center</Title>
                    <Paragraph className="text-slate-400 mt-2 mb-0">Global administrator panel for managing enterprise recruitment across all partner colleges.</Paragraph>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    className="!h-14 px-8 !rounded-2xl !text-lg !font-bold"
                    onClick={() => setIsModalOpen(true)}
                >
                    Create New Opening
                </Button>
            </motion.div>

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card overflow-hidden"
                >
                    <Table
                        columns={columns}
                        dataSource={jobs}
                        loading={loading}
                        rowKey="_id"
                        pagination={{ pageSize: 8 }}
                        className="custom-table"
                        locale={{ emptyText: <div className="py-20 text-slate-500">No active job listings found</div> }}
                    />
                </motion.div>
            </AnimatePresence>

            <Modal
                title={<Title level={3} className="!text-white !m-0">Publish New Opportunity</Title>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={700}
                className="admin-modal"
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handlePostJob}
                    className="mt-8"
                    requiredMark={false}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Form.Item name="title" label={<span className="text-slate-300">Job Title</span>} rules={[{ required: true }]}>
                            <Input placeholder="e.g. Senior Software Engineer" className="!h-12 !rounded-xl" />
                        </Form.Item>
                        <Form.Item name="company" label={<span className="text-slate-300">Company Name</span>} rules={[{ required: true }]}>
                            <Input placeholder="e.g. Google India" className="!h-12 !rounded-xl" />
                        </Form.Item>
                    </div>

                    <Form.Item name="location" label={<span className="text-slate-300">Placement Location</span>} rules={[{ required: true }]}>
                        <Input prefix={<GlobalOutlined className="text-slate-500 mr-2" />} placeholder="e.g. Bangalore (Remote Friendly)" className="!h-12 !rounded-xl" />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Form.Item name="salary" label={<span className="text-slate-300">Compensation Package</span>}>
                            <Input prefix={<DollarOutlined className="text-slate-500 mr-2" />} placeholder="e.g. 18 - 24 LPA" className="!h-12 !rounded-xl" />
                        </Form.Item>
                        <Form.Item name="experience" label={<span className="text-slate-300">Experience Tier</span>}>
                            <Input prefix={<ExperimentOutlined className="text-slate-500 mr-2" />} placeholder="e.g. 0-2 Years / Freshers" className="!h-12 !rounded-xl" />
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label={<span className="text-slate-300">Detailed Description</span>} rules={[{ required: true }]}>
                        <TextArea rows={4} className="!rounded-xl p-4" placeholder="Outline the role, responsibilities and expectations..." />
                    </Form.Item>

                    <Form.Item name="skills" label={<span className="text-slate-300">Core Competencies (Comma Separated)</span>}>
                        <Input placeholder="React, Node.js, AWS, System Design" className="!h-12 !rounded-xl" />
                    </Form.Item>

                    <div className="flex gap-4 mt-10">
                        <Button className="!h-14 !rounded-2xl flex-1 !bg-slate-700 !text-white !border-none font-bold" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" className="!h-14 !rounded-2xl flex-1 font-bold shadow-xl" icon={<RocketOutlined />}>
                            Publish Opening
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;

