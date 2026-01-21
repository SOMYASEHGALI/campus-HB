import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Tag, Typography, Skeleton, Empty, Badge, Modal, Input, message } from 'antd';
import { EnvironmentOutlined, DollarOutlined, ExperimentOutlined, ArrowRightOutlined, RocketOutlined, TeamOutlined, TrophyOutlined, SafetyOutlined, ThunderboltOutlined, StarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getApiUrl } from '../config/api';

const { Title, Text } = Typography;

const Home = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(getApiUrl('jobs'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen">
                {/* Section 1: Hero - Empowering Students and Placement Cells */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto px-4 py-20 text-center min-h-screen flex flex-col justify-center"
                >
                    <div className="mb-6">
                        <span className="inline-block px-6 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 font-semibold text-sm tracking-wide uppercase mb-8">
                            🚀 Next-Gen Campus Recruitment Platform
                        </span>
                    </div>

                    <Title className="!text-7xl !text-white !font-extrabold mb-8 !leading-tight">
                        Empowering Students &<br />
                        <span className="gradient-text">Placement Cells</span>
                    </Title>

                    <Text className="text-2xl text-slate-300 mb-6 block max-w-3xl mx-auto leading-relaxed font-medium">
                        Our platform empowers students and placement cells by <span className="text-indigo-400 font-bold">increasing the opportunities</span> for them
                    </Text>

                    <Text className="text-lg text-slate-400 mb-16 block max-w-2xl mx-auto leading-relaxed">
                        Bridge the gap between talent and opportunity with cutting-edge technology designed for modern campus recruitment
                    </Text>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-8 hover:border-indigo-500/50 transition-all group"
                        >
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <RocketOutlined className="text-3xl text-indigo-400" />
                            </div>
                            <h3 className="text-white font-bold text-xl mb-2">Streamlined Process</h3>
                            <p className="text-slate-400">Simplify recruitment with our intuitive platform</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-8 hover:border-indigo-500/50 transition-all group"
                        >
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ThunderboltOutlined className="text-3xl text-indigo-400" />
                            </div>
                            <h3 className="text-white font-bold text-xl mb-2">Real-Time Updates</h3>
                            <p className="text-slate-400">Stay connected with instant notifications</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-8 hover:border-indigo-500/50 transition-all group"
                        >
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <SafetyOutlined className="text-3xl text-indigo-400" />
                            </div>
                            <h3 className="text-white font-bold text-xl mb-2">Secure & Reliable</h3>
                            <p className="text-slate-400">Enterprise-grade security for your data</p>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-500 mb-4">
                        <div className="h-px w-12 bg-slate-700"></div>
                        <span className="text-sm">Scroll to explore</span>
                        <div className="h-px w-12 bg-slate-700"></div>
                    </div>
                </motion.div>

                {/* Section 2: Join as College Students / Placement Cells */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto px-4 py-32 min-h-screen flex flex-col justify-center"
                >
                    <div className="text-center mb-16">
                        <span className="inline-block px-6 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 font-semibold text-sm tracking-wide uppercase mb-6">
                            ✨ Join Our Community
                        </span>
                        <Title className="!text-6xl !text-white !font-extrabold mb-6 !leading-tight">
                            Who Can <span className="gradient-text">Join?</span>
                        </Title>
                        <Text className="text-xl text-slate-300 block max-w-2xl mx-auto">
                            Whether you're a student seeking opportunities or a placement cell managing recruitment
                        </Text>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Students Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            className="glass-card p-10 hover:border-indigo-500/50 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <TeamOutlined className="text-4xl text-indigo-400" />
                                </div>
                                <h3 className="text-white font-bold text-3xl mb-4">College Students</h3>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                    Access exclusive job opportunities, track your applications, and connect with top recruiters
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <StarOutlined className="text-indigo-400" />
                                        <span>Browse unlimited job postings</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <StarOutlined className="text-indigo-400" />
                                        <span>One-click application process</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <StarOutlined className="text-indigo-400" />
                                        <span>Real-time application tracking</span>
                                    </li>
                                </ul>
                                <Link to="/register">
                                    <Button
                                        type="primary"
                                        size="large"
                                        block
                                        className="!h-14 !text-lg !rounded-xl font-bold group-hover:scale-105 transition-transform"
                                    >
                                        Join as Student
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Placement Cells Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            viewport={{ once: true }}
                            className="glass-card p-10 hover:border-purple-500/50 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative">
                                <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <TrophyOutlined className="text-4xl text-purple-400" />
                                </div>
                                <h3 className="text-white font-bold text-3xl mb-4">Placement Cells</h3>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                    Manage recruitment drives, post jobs, and streamline the entire placement process
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <StarOutlined className="text-purple-400" />
                                        <span>Bulk resume uploads</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <StarOutlined className="text-purple-400" />
                                        <span>Advanced analytics dashboard</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-300">
                                        <StarOutlined className="text-purple-400" />
                                        <span>Centralized application management</span>
                                    </li>
                                </ul>
                                <Link to="/register">
                                    <Button
                                        size="large"
                                        block
                                        className="!h-14 !text-lg !rounded-xl font-bold !bg-purple-500 hover:!bg-purple-600 !text-white !border-0 group-hover:scale-105 transition-transform"
                                    >
                                        Join as Placement Cell
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Section 3: Get Started - Unlock New Opportunities */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto px-4 py-32 min-h-screen flex flex-col justify-center"
                >
                    <div className="text-center">
                        <span className="inline-block px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-semibold text-sm tracking-wide uppercase mb-6">
                            🎯 Ready to Begin?
                        </span>
                        <Title className="!text-7xl !text-white !font-extrabold mb-8 !leading-tight">
                            Unlock New <br />
                            <span className="gradient-text">Opportunities</span>
                        </Title>
                        <Text className="text-2xl text-slate-300 mb-12 block max-w-3xl mx-auto leading-relaxed">
                            Start your journey today and discover endless possibilities for growth and success
                        </Text>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                            <Link to="/register">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<RocketOutlined />}
                                    className="!h-16 px-12 !text-xl !rounded-2xl font-bold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
                                >
                                    Get Started Now
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button
                                    size="large"
                                    ghost
                                    className="!h-16 px-12 !text-xl !rounded-2xl !text-white !border-white/20 hover:!border-indigo-400 font-bold"
                                >
                                    Already Have an Account?
                                </Button>
                            </Link>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20">
                            <div className="glass-card p-8 border-dashed">
                                <div className="text-5xl font-extrabold text-indigo-400 mb-2">500+</div>
                                <div className="text-slate-400 font-medium">Active Students</div>
                            </div>
                            <div className="glass-card p-8 border-dashed">
                                <div className="text-5xl font-extrabold text-purple-400 mb-2">50+</div>
                                <div className="text-slate-400 font-medium">Partner Colleges</div>
                            </div>
                            <div className="glass-card p-8 border-dashed">
                                <div className="text-5xl font-extrabold text-emerald-400 mb-2">1000+</div>
                                <div className="text-slate-400 font-medium">Job Opportunities</div>
                            </div>
                        </div>

                        <div className="mt-20 p-8 glass-card border-dashed max-w-2xl mx-auto">
                            <p className="text-indigo-400 font-medium tracking-wide uppercase text-sm">
                                🔒 Authenticated Access Only
                            </p>
                            <p className="text-slate-500 mt-2">Please login to access live job boards and recruitment statistics.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Title level={2} className="!text-white !m-0 !font-bold">Active Opportunities</Title>
                        <Tag color={user.role === 'admin' ? 'red' : user.role === 'staff' ? 'gold' : 'blue'} className="capitalize !rounded-full px-4 !m-0 !py-1 font-bold">
                            {user.role} Dashboard
                        </Tag>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <Text className="text-slate-400 text-lg">Welcome back,</Text>
                            <span className="text-white font-black text-xl tracking-tight">{user.name}</span>
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {user.role}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            <Text className="text-slate-500 font-medium">Verified Official of: <span className="text-slate-200 font-bold italic underline decoration-indigo-500/50">{user.collegeName || 'HiringBazar Headquarters'}</span></Text>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Badge count={jobs.length} color="#6366f1" offset={[0, 0]}>
                        <div className="px-6 py-2 glass-card font-semibold text-slate-300">Live Jobs</div>
                    </Badge>
                </div>
            </div>



            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="!bg-slate-800/40 !border-white/5 !rounded-2xl">
                            <Skeleton active avatar paragraph={{ rows: 3 }} />
                        </Card>
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div className="glass-card py-20 flex flex-col items-center">
                    <Empty description={<span className="text-slate-400 text-lg">No active jobs found at the moment</span>} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job, index) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                hoverable
                                className="!bg-slate-800/40 !border-white/5 !rounded-3xl !backdrop-blur-md hover:!border-indigo-500/50 group overflow-hidden transition-all duration-300"
                                bodyStyle={{ padding: '24px' }}
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <Tag color="rgba(99, 102, 241, 0.1)" className="!text-indigo-400 !border-indigo-400/30 !rounded-full !m-0 px-3">
                                        Full-Time
                                    </Tag>
                                </div>

                                <Title level={4} className="!text-white !mb-1 !font-bold truncate group-hover:text-indigo-400 transition-colors">
                                    {job.title}
                                </Title>
                                <Text className="text-indigo-400/80 font-semibold block mb-6">{job.company}</Text>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                                            <EnvironmentOutlined />
                                        </div>
                                        <span className="text-sm">{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                                            <DollarOutlined />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">{job.salary}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                                            <ExperimentOutlined />
                                        </div>
                                        <span className="text-sm">{job.experience} Required</span>
                                    </div>
                                </div>

                                <Link to={`/job/${job._id}`}>
                                    <Button
                                        type="primary"
                                        block
                                        icon={<ArrowRightOutlined />}
                                        className="!h-12 !rounded-xl group-hover:scale-[1.02] transition-transform"
                                    >
                                        {user.role === 'staff' ? 'Submit Bulk Data' : 'Manage Applications'}
                                    </Button>
                                </Link>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
