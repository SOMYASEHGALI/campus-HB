import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Typography, message, Card, Table, Tag, Space, Modal, Tooltip, Select, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, RocketOutlined, GlobalOutlined, DollarOutlined, ExperimentOutlined, BankOutlined, TeamOutlined, FileTextOutlined, EyeOutlined, CloudUploadOutlined, UserOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AdminDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [applications, setApplications] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [bulkFilter, setBulkFilter] = useState('all');

    useEffect(() => {
        fetchJobs();
        fetchStats();
        fetchUsers();
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

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/applications/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setColleges(res.data.colleges);
            setApplications(res.data.applications);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            message.error('Failed to fetch users');
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            console.log('[Frontend] Toggling user status:', { userId, currentStatus });
            const token = localStorage.getItem('token');
            const response = await axios.patch(`http://localhost:5000/api/users/${userId}/toggle-status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[Frontend] Toggle response:', response.data);
            message.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchUsers();
        } catch (err) {
            console.error('[Frontend] Toggle error:', err);
            console.error('[Frontend] Error response:', err.response?.data);
            message.error(err.response?.data?.message || err.message || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        Modal.confirm({
            title: 'Delete User Permanently?',
            content: `Are you sure you want to delete ${userName}? This will permanently remove the user and all their applications from the system.`,
            okText: 'Delete Permanently',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    message.success('User deleted successfully');
                    fetchUsers();
                    fetchStats();
                } catch (err) {
                    message.error(err.response?.data?.message || 'Failed to delete user');
                }
            }
        });
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
            fetchStats();
        } catch (err) {
            message.error('Failed to post job');
        }
    };

    const handleDeleteJob = async (jobId) => {
        Modal.confirm({
            title: 'Delete Job Opening?',
            content: 'Are you sure you want to delete this job opening? This will permanently remove the opening and all associated candidate applications from the system.',
            okText: 'Delete Permanently',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    message.success('Job and associations deleted successfully');
                    fetchJobs();
                    fetchStats();
                } catch (err) {
                    message.error(err.response?.data?.message || 'Failed to delete job');
                }
            }
        });
    };

    const handleExport = (jobId) => {
        const token = localStorage.getItem('token');
        window.open(`http://localhost:5000/api/applications/export/${jobId}?token=${token}`, '_blank');
    };

    const handleExportAll = () => {
        const token = localStorage.getItem('token');
        window.open(`http://localhost:5000/api/applications/export-all?token=${token}`, '_blank');
    };

    const handleExportByCollege = (collegeName) => {
        if (!collegeName || collegeName === 'all') {
            handleExportAll();
            return;
        }
        const token = localStorage.getItem('token');
        window.open(`http://localhost:5000/api/applications/export-by-college/${encodeURIComponent(collegeName)}?token=${token}`, '_blank');
    };

    const getFullUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:5000${url}`;
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
            title: 'Target Colleges',
            dataIndex: 'allowedColleges',
            key: 'allowedColleges',
            render: (colleges) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {colleges?.map(college => (
                        <Tag key={college} color="purple" className="!rounded-md border-purple-500/30 !bg-purple-500/10 !text-purple-300 text-[10px] m-0">
                            {college}
                        </Tag>
                    ))}
                </div>
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
                    <Tooltip title="Delete Opening">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteJob(record._id)}
                            className="!bg-red-500/10 !border-red-500/20 hover:!bg-red-500 hover:!text-white transition-all"
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const collegeColumns = [
        {
            title: 'College Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text className="!text-white !font-bold text-lg">{text}</Text>
        },
        {
            title: 'Registered Users',
            dataIndex: 'users',
            key: 'users',
            render: (count) => <Tag color="blue" className="!px-4 !rounded-lg">{count} Users</Tag>
        },
        {
            title: 'Applications Submitted',
            dataIndex: 'applications',
            key: 'applications',
            render: (count) => <Tag color="gold" className="!px-4 !rounded-lg">{count} Total</Tag>
        },
        {
            title: 'Bulk Transfers',
            dataIndex: 'bulkUploads',
            key: 'bulkUploads',
            render: (count) => (
                <div className="flex items-center gap-2">
                    <Tag color="cyan" className="!px-4 !rounded-lg">{count} Bulk</Tag>
                    {count > 0 && <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Active staff feed</span>}
                </div>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Tooltip title={`Export ${record.name} Applications`}>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => handleExportByCollege(record.name)}
                        className="!bg-emerald-600/20 !text-emerald-400 !border-emerald-500/30 hover:!bg-emerald-600 hover:!text-white transition-all rounded-lg"
                    >
                        Export Excel
                    </Button>
                </Tooltip>
            )
        }
    ];

    const applicationColumns = [
        {
            title: 'Student Name',
            dataIndex: 'studentName',
            key: 'studentName',
            render: (text, record) => (
                <div>
                    <div className="flex items-center gap-2">
                        <Text className="!text-white !font-bold block">{text}</Text>
                        {record.isBulk && (
                            <Tooltip title={`Bulk added by ${record.uploadedBy?.name || 'Staff'} from ${record.uploadedBy?.collegeName || 'Partner College'}`}>
                                <Tag color="cyan" className="!cursor-help !text-[9px] !rounded-md h-4 flex items-center px-1 font-bold border-cyan-500/30">
                                    BULK
                                </Tag>
                            </Tooltip>
                        )}
                    </div>
                    <Text className="text-slate-500 text-xs">
                        {record.isBulk ? (
                            <span>Via: <Text className="text-slate-400 italic">{record.uploadedBy?.collegeName || 'Bulk Upload'}</Text></span>
                        ) : (
                            record.studentId?.collegeName
                        )}
                    </Text>
                </div>
            )
        },
        {
            title: 'Job Applied For',
            key: 'job',
            render: (_, record) => (
                <div>
                    <Text className="!text-indigo-400 font-semibold block">{record.jobId?.title}</Text>
                    <Text className="text-slate-500 text-xs">{record.jobId?.company}</Text>
                </div>
            )
        },
        {
            title: 'Application Date',
            dataIndex: 'appliedAt',
            key: 'appliedAt',
            render: (date) => <Text className="text-slate-400">{new Date(date).toLocaleDateString()}</Text>
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text className="text-slate-400 text-xs">{record.email}</Text>
                    <Text className="text-slate-400 text-xs">{record.phone}</Text>
                </Space>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedApp(record);
                            setIsProfileModalOpen(true);
                        }}
                        className="!bg-indigo-600/20 !text-indigo-400 !border-indigo-500/30 hover:!bg-indigo-600 hover:!text-white transition-all rounded-lg"
                    >
                        Details
                    </Button>
                    {record.resumeUrl && (
                        <Button
                            icon={<FileTextOutlined />}
                            onClick={() => window.open(getFullUrl(record.resumeUrl), '_blank')}
                            className="!bg-amber-600/20 !text-amber-400 !border-amber-500/30 hover:!bg-amber-600 hover:!text-white transition-all rounded-lg"
                        >
                            Open CV
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    const bulkApplicationColumns = [
        {
            title: 'Staff Identity',
            key: 'staff',
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xl font-black border border-indigo-500/20">
                        {record.staffName.charAt(0)}
                    </div>
                    <div>
                        <Text className="!text-white font-black block tracking-tight">{record.staffName}</Text>
                        <Text className="text-indigo-400 text-[10px] uppercase font-bold tracking-widest">{record.collegeName}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Total Contributions',
            dataIndex: 'students',
            key: 'contributions',
            render: (students) => (
                <div className="flex items-center gap-2">
                    <Tag color="cyan" className="!px-4 !rounded-lg !border-cyan-500/30 !bg-cyan-500/10 !text-cyan-400 font-bold">
                        {students.length} Records
                    </Tag>
                </div>
            )
        },
        {
            title: 'Last Broadcast',
            dataIndex: 'lastUpdate',
            key: 'lastUpdate',
            render: (date) => <Text className="text-slate-500 text-xs">{new Date(date).toLocaleString()}</Text>
        }
    ];

    const getGroupedStaffData = () => {
        const bulkApps = applications.filter(app => app.isBulk || app.uploadedBy);
        const staffGroups = {};

        bulkApps.forEach(app => {
            const staffId = app.uploadedBy?._id || 'anonymous';
            if (!staffGroups[staffId]) {
                staffGroups[staffId] = {
                    key: staffId,
                    staffName: app.uploadedBy?.name || 'Authorized Staff',
                    collegeName: app.uploadedBy?.collegeName || 'Verified Organization',
                    lastUpdate: app.appliedAt,
                    students: []
                };
            }
            staffGroups[staffId].students.push(app);
            if (new Date(app.appliedAt) > new Date(staffGroups[staffId].lastUpdate)) {
                staffGroups[staffId].lastUpdate = app.appliedAt;
            }
        });

        const data = Object.values(staffGroups);
        if (bulkFilter === 'all') return data;
        return data.filter(group => group.collegeName === bulkFilter);
    };

    const userColumns = [
        {
            title: 'User Information',
            key: 'userInfo',
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl font-black shadow-lg">
                        {record.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <Text className="!text-white font-bold block text-lg">{record.name}</Text>
                        <Text className="text-slate-400 text-xs">{record.email}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'College',
            dataIndex: 'collegeName',
            key: 'collegeName',
            render: (text) => <Text className="text-indigo-400 font-semibold">{text}</Text>
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const roleColors = {
                    admin: 'red',
                    staff: 'blue',
                    student: 'green'
                };
                return (
                    <Tag color={roleColors[role]} className="!px-4 !rounded-lg !font-bold uppercase">
                        {role}
                    </Tag>
                );
            }
        },
        {
            title: 'Applications',
            dataIndex: 'applicationCount',
            key: 'applicationCount',
            render: (count) => (
                <Tag color="purple" className="!px-4 !rounded-lg">
                    {count || 0} Applied
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag
                    color={isActive ? 'success' : 'error'}
                    className="!px-4 !rounded-full !font-bold"
                    icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                >
                    {isActive ? 'Active' : 'Deactivated'}
                </Tag>
            )
        },
        {
            title: 'Joined',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <Text className="text-slate-400 text-sm">
                    {new Date(date).toLocaleDateString()}
                </Text>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title={record.isActive ? 'Deactivate Account' : 'Activate Account'}>
                        <Button
                            size="small"
                            icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
                            onClick={() => handleToggleUserStatus(record._id, record.isActive)}
                            className={record.isActive
                                ? "!bg-orange-600/20 !text-orange-400 !border-orange-500/30 hover:!bg-orange-600 hover:!text-white transition-all rounded-lg"
                                : "!bg-green-600/20 !text-green-400 !border-green-500/30 hover:!bg-green-600 hover:!text-white transition-all rounded-lg"
                            }
                        >
                            {record.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete User Permanently">
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteUser(record._id, record.name)}
                            className="!bg-red-500/10 !border-red-500/20 hover:!bg-red-500 hover:!text-white transition-all rounded-lg"
                        >
                            Delete
                        </Button>
                    </Tooltip>
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
                <div className="flex gap-4">
                    <Button
                        size="large"
                        icon={<RocketOutlined className="animate-pulse text-indigo-400" />}
                        className="!h-14 px-8 !rounded-2xl !text-lg !font-bold !bg-indigo-600/10 !text-indigo-400 !border-indigo-500/20"
                        onClick={() => {
                            fetchJobs();
                            fetchStats();
                            fetchUsers();
                            message.success('System synchronization successful');
                        }}
                    >
                        Sync Enterprise Data
                    </Button>
                    <Button
                        size="large"
                        icon={<DownloadOutlined />}
                        className="!h-14 px-8 !rounded-2xl !text-lg !font-bold !bg-slate-700 !text-white !border-none"
                        onClick={handleExportAll}
                    >
                        Export Master File
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        className="!h-14 px-8 !rounded-2xl !text-lg !font-bold"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create New Opening
                    </Button>
                </div>
            </motion.div>

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card overflow-hidden !bg-transparent !border-none"
                >
                    <Tabs
                        defaultActiveKey="1"
                        className="custom-tabs"
                        type="card"
                        items={[
                            {
                                key: '1',
                                label: <span><RocketOutlined /> Job Openings</span>,
                                children: (
                                    <Table
                                        columns={columns}
                                        dataSource={jobs}
                                        loading={loading}
                                        rowKey="_id"
                                        pagination={{ pageSize: 8 }}
                                        className="custom-table"
                                        locale={{ emptyText: <div className="py-20 text-slate-500">No active job listings found</div> }}
                                    />
                                )
                            },
                            {
                                key: '2',
                                label: <span><BankOutlined /> Partner Colleges</span>,
                                children: (
                                    <Table
                                        columns={collegeColumns}
                                        dataSource={colleges}
                                        loading={loading}
                                        rowKey="name"
                                        pagination={{ pageSize: 8 }}
                                        className="custom-table"
                                    />
                                )
                            },
                            {
                                key: '3',
                                label: <span><TeamOutlined /> All Applications <Badge count={applications.length} showZero overflowCount={999} className="ml-2" color="#6366f1" /></span>,
                                children: (
                                    <Table
                                        columns={applicationColumns}
                                        dataSource={applications}
                                        loading={loading}
                                        rowKey="_id"
                                        pagination={{ pageSize: 10 }}
                                        className="custom-table"
                                    />
                                )
                            },
                            {
                                key: '4',
                                label: <span><CloudUploadOutlined className="text-cyan-400" /> Staff Bulk Feeds <Badge count={applications.filter(app => app.isBulk || app.uploadedBy).length} showZero className="ml-2" color="#22d3ee" /></span>,
                                children: (
                                    <div className="space-y-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/20 p-6 rounded-2xl border border-white/5">
                                            <div>
                                                <Title level={4} className="!text-white !m-0">Institutional Audit</Title>
                                                <Text className="text-slate-500">Filter bulk transmissions by college or organization</Text>
                                            </div>
                                            <div className="w-full md:w-[450px] flex gap-3">
                                                <Select
                                                    className="flex-1 !h-12 custom-select-dark"
                                                    placeholder="Select Organization"
                                                    defaultValue="all"
                                                    onChange={(value) => setBulkFilter(value)}
                                                >
                                                    <Select.Option value="all">View All Organizations ({applications.filter(app => app.isBulk || app.uploadedBy).length} CVs)</Select.Option>
                                                    {colleges.map(college => (
                                                        <Select.Option key={college.name} value={college.name}>
                                                            {college.name} ({college.bulkUploads || 0} CVs)
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                                <Button
                                                    icon={<DownloadOutlined />}
                                                    className="!h-12 px-6 !rounded-xl !bg-indigo-600 !text-white !border-none font-bold hover:!bg-indigo-500 transition-all flex items-center gap-2"
                                                    onClick={() => handleExportByCollege(bulkFilter)}
                                                >
                                                    {bulkFilter === 'all' ? 'Export All' : 'Export Organization'}
                                                </Button>
                                            </div>
                                        </div>
                                        <Table
                                            columns={bulkApplicationColumns}
                                            dataSource={getGroupedStaffData()}
                                            loading={loading}
                                            rowKey="key"
                                            pagination={{ pageSize: 15 }}
                                            className="custom-table"
                                            expandable={{
                                                expandedRowRender: (record) => (
                                                    <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 mx-4 shadow-2xl">
                                                        <div className="flex justify-between items-center mb-8">
                                                            <div>
                                                                <Title level={4} className="!text-white !m-0">Records from {record.staffName}</Title>
                                                                <Text className="text-slate-500 text-xs uppercase tracking-widest font-bold">Institutional Audit Feed</Text>
                                                            </div>
                                                            <Badge count={`${record.students.length} CVs`} color="#6366f1" />
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {record.students.map((student, index) => (
                                                                <div key={student._id} className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                                                                    <div className="flex items-center gap-5">
                                                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 font-mono text-xs">
                                                                            {String(index + 1).padStart(2, '0')}
                                                                        </div>
                                                                        <div>
                                                                            <Text className="!text-white font-bold block text-lg">{student.studentName}</Text>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <Text className="text-indigo-400 text-xs font-semibold">{student.jobId?.title}</Text>
                                                                                <Text className="text-slate-600 text-[10px]">|</Text>
                                                                                <Text className="text-slate-500 text-xs">{student.email}</Text>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Space>
                                                                        <Button
                                                                            size="small"
                                                                            type="primary"
                                                                            icon={<FileTextOutlined className="!text-[10px]" />}
                                                                            onClick={() => window.open(getFullUrl(student.resumeUrl), '_blank')}
                                                                            className="!text-[10px] !bg-indigo-600 !border-none rounded-lg h-9 px-4"
                                                                        >
                                                                            Preview
                                                                        </Button>
                                                                        <Button
                                                                            size="small"
                                                                            icon={<DownloadOutlined className="!text-[10px]" />}
                                                                            onClick={async () => {
                                                                                try {
                                                                                    const res = await fetch(getFullUrl(student.resumeUrl));
                                                                                    const blob = await res.blob();
                                                                                    const url = window.URL.createObjectURL(blob);
                                                                                    const a = document.createElement('a');
                                                                                    a.href = url;
                                                                                    a.download = `${student.studentName}_CV.pdf`;
                                                                                    a.click();
                                                                                } catch (e) {
                                                                                    window.open(getFullUrl(student.resumeUrl), '_blank');
                                                                                }
                                                                            }}
                                                                            className="!text-[10px] !bg-amber-600/10 !text-amber-500 !border-none rounded-lg h-9 px-4 hover:!bg-amber-600 hover:!text-white"
                                                                        >
                                                                            Save PDF
                                                                        </Button>
                                                                        <Button
                                                                            size="small"
                                                                            onClick={() => {
                                                                                setSelectedApp(student);
                                                                                setIsProfileModalOpen(true);
                                                                            }}
                                                                            className="!text-[10px] !bg-slate-700 !text-white !border-none rounded-lg h-9 px-4"
                                                                        >
                                                                            Full Profile
                                                                        </Button>
                                                                    </Space>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            }}
                                            locale={{
                                                emptyText: (
                                                    <div className="py-20 text-center">
                                                        <CloudUploadOutlined className="text-5xl text-slate-700 mb-4" />
                                                        <div className="text-slate-500 text-lg font-medium">No verified staff transmissions found</div>
                                                        <div className="text-slate-600 text-sm mt-2">Grouped data will appear here once bulk broadcasts are initiated.</div>
                                                    </div>
                                                )
                                            }}
                                        />
                                    </div>
                                )
                            },
                            {
                                key: '5',
                                label: <span><UserOutlined className="text-amber-400" /> User Management <Badge count={users.length} showZero className="ml-2" color="#f59e0b" /></span>,
                                children: (
                                    <div className="space-y-6">
                                        <div className="bg-slate-800/20 p-6 rounded-2xl border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Title level={4} className="!text-white !m-0">System Users</Title>
                                                    <Text className="text-slate-500">Manage all registered users across the platform</Text>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Tag color="green" className="!px-4 !py-2 !rounded-lg !text-sm">
                                                        {users.filter(u => u.isActive).length} Active
                                                    </Tag>
                                                    <Tag color="red" className="!px-4 !py-2 !rounded-lg !text-sm">
                                                        {users.filter(u => !u.isActive).length} Deactivated
                                                    </Tag>
                                                </div>
                                            </div>
                                        </div>
                                        <Table
                                            columns={userColumns}
                                            dataSource={users}
                                            loading={loading}
                                            rowKey="_id"
                                            pagination={{ pageSize: 10 }}
                                            className="custom-table"
                                            locale={{
                                                emptyText: (
                                                    <div className="py-20 text-center">
                                                        <UserOutlined className="text-5xl text-slate-700 mb-4" />
                                                        <div className="text-slate-500 text-lg font-medium">No users found</div>
                                                        <div className="text-slate-600 text-sm mt-2">User accounts will appear here once registered.</div>
                                                    </div>
                                                )
                                            }}
                                        />
                                    </div>
                                )
                            }
                        ]}
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

                    <Form.Item name="allowedColleges" label={<span className="text-slate-300">Target Colleges</span>} rules={[{ required: true, message: 'Please select at least one college' }]}>
                        <Select
                            mode="multiple"
                            placeholder="Select target colleges"
                            className="!rounded-xl"
                            style={{ width: '100%' }}
                        >
                            {colleges.map(college => (
                                <Select.Option key={college.name} value={college.name}>
                                    {college.name}
                                </Select.Option>
                            ))}
                        </Select>
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

            {/* Student Profile Modal */}
            <Modal
                title={<Title level={3} className="!text-white !m-0">Candidate Profile</Title>}
                open={isProfileModalOpen}
                onCancel={() => setIsProfileModalOpen(false)}
                footer={null}
                width={600}
                className="admin-modal"
                centered
            >
                {selectedApp && (
                    <div className="py-6">
                        <div className="flex items-center gap-6 mb-8 p-6 bg-slate-900/50 rounded-[2rem] border border-white/5">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20">
                                {selectedApp.studentName.charAt(0)}
                            </div>
                            <div>
                                <Title level={2} className="!text-white !m-0">{selectedApp.studentName}</Title>
                                <Tag color="blue" className="!rounded-full px-3 mt-1">{selectedApp.studentId?.collegeName || 'N/A'}</Tag>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="glass-card p-4 !bg-slate-800/40">
                                <Text className="text-slate-500 block text-xs uppercase font-bold mb-1">Email Address</Text>
                                <Text className="text-slate-200 font-medium">{selectedApp.email}</Text>
                            </div>
                            <div className="glass-card p-4 !bg-slate-800/40">
                                <Text className="text-slate-500 block text-xs uppercase font-bold mb-1">Phone Number</Text>
                                <Text className="text-slate-200 font-medium">{selectedApp.phone}</Text>
                            </div>
                            <div className="glass-card p-4 !bg-slate-800/40">
                                <Text className="text-slate-500 block text-xs uppercase font-bold mb-1">Roll / UID Number</Text>
                                <Text className="text-slate-200 font-medium">{selectedApp.rollNumber || 'Not Provided'}</Text>
                            </div>
                            <div className="glass-card p-4 !bg-slate-800/40">
                                <Text className="text-slate-500 block text-xs uppercase font-bold mb-1">Target Application</Text>
                                <Text className="text-indigo-400 font-bold">{selectedApp.jobId?.title}</Text>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="primary"
                                block
                                size="large"
                                icon={<FileTextOutlined />}
                                className="!h-14 !rounded-2xl shadow-lg !bg-indigo-600 hover:!bg-indigo-700"
                                onClick={() => window.open(getFullUrl(selectedApp.resumeUrl), '_blank')}
                            >
                                View CV in Browser
                            </Button>
                            <Button
                                block
                                size="large"
                                icon={<DownloadOutlined />}
                                className="!h-14 !rounded-2xl !bg-amber-600/10 !text-amber-500 !border-amber-500/30 hover:!bg-amber-600 hover:!text-white transition-all shadow-lg"
                                onClick={async () => {
                                    try {
                                        const response = await fetch(getFullUrl(selectedApp.resumeUrl));
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', `${selectedApp.studentName}_CV.pdf`);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.parentNode.removeChild(link);
                                        message.success('Download initiated');
                                    } catch (error) {
                                        window.open(getFullUrl(selectedApp.resumeUrl), '_blank');
                                        message.info('Opening in browser (direct download restricted by provider)');
                                    }
                                }}
                            >
                                Download Professional CV
                            </Button>
                            <Button
                                block
                                size="large"
                                className="!h-14 !rounded-2xl !bg-slate-700 !text-white !border-none"
                                onClick={() => setIsProfileModalOpen(false)}
                            >
                                Close Profile
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;

