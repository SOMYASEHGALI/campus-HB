import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Button, Tag, Typography, Skeleton, Empty, Badge } from 'antd';
import { EnvironmentOutlined, DollarOutlined, ExperimentOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

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
            const res = await axios.get('http://localhost:5000/api/jobs', {
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
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Title className="!text-6xl !text-white !font-bold mb-6 !leading-tight">
                        The Next Generation of <br />
                        <span className="gradient-text">Campus Recruitment</span>
                    </Title>
                    <Text className="text-xl text-slate-400 mb-12 block max-w-2xl mx-auto leading-relaxed">
                        Bridge the gap between talent and opportunity. Our platform empowers placement cells
                        to streamline hiring processes with cutting-edge technology.
                    </Text>
                    <div className="flex gap-4 justify-center mt-10">
                        <Link to="/register">
                            <Button type="primary" size="large" className="!h-14 px-10 !text-lg rounded-xl">
                                Join as College
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="large" ghost className="!h-14 px-10 !text-lg rounded-xl !text-white !border-white/20 hover:!border-indigo-400">
                                View Openings
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-20 p-8 glass-card border-dashed">
                        <p className="text-indigo-400 font-medium tracking-wide uppercase text-sm">
                            🔒 Authenticated Access Only
                        </p>
                        <p className="text-slate-500 mt-2">Please login to access live job boards and recruitment statistics.</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <Title level={2} className="!text-white !m-0 !font-bold">Active Opportunities</Title>
                    <Text className="text-slate-400">Welcome back! Manage and track student applications across {jobs.length} live openings.</Text>
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
                                        Manage Applications
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
