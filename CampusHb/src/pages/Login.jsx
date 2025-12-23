import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Card, Tabs } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined, SecurityScanOutlined, BankOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', values);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            message.success('Welcome back to CampusHB!');
            navigate('/');
        } catch (err) {
            message.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const onAdminFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/admin-login', values);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            message.success('Master Admin Access Granted!');
            navigate('/');
        } catch (err) {
            message.error(err.response?.data?.message || 'Invalid Admin Key.');
        } finally {
            setLoading(false);
        }
    };

    const loginItems = [
        {
            key: 'college',
            label: (
                <span className="flex items-center gap-2 px-4">
                    <BankOutlined /> College Portal
                </span>
            ),
            children: (
                <Form
                    name="login"
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                    className="mt-6"
                >
                    <Form.Item
                        name="email"
                        label={<span className="text-slate-300 font-medium">Email Address</span>}
                        rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                    >
                        <Input
                            prefix={<MailOutlined className="text-slate-500 mr-2" />}
                            placeholder="name@college.edu"
                            className="!h-12 !rounded-xl"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={<span className="text-slate-300 font-medium">Password</span>}
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-slate-500 mr-2" />}
                            placeholder="••••••••"
                            className="!h-12 !rounded-xl"
                        />
                    </Form.Item>

                    <Form.Item className="mt-8">
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            size="large"
                            className="!h-12 !rounded-xl font-bold text-lg"
                            icon={<ArrowRightOutlined />}
                        >
                            Login to Portal
                        </Button>
                    </Form.Item>
                </Form>
            )
        },
        {
            key: 'admin',
            label: (
                <span className="flex items-center gap-2 px-4">
                    <SecurityScanOutlined /> Admin Access
                </span>
            ),
            children: (
                <Form
                    name="admin-login"
                    layout="vertical"
                    onFinish={onAdminFinish}
                    requiredMark={false}
                    className="mt-6"
                >
                    <div className="bg-indigo-500/10 p-4 rounded-2xl mb-8 border border-indigo-500/20">
                        <Text className="text-indigo-300 text-sm">
                            Authorized personnel only. Please enter the global master key for command center access.
                        </Text>
                    </div>

                    <Form.Item
                        name="adminKey"
                        label={<span className="text-slate-300 font-medium">Master Authorization Key</span>}
                        rules={[{ required: true, message: 'Admin Key is required' }]}
                    >
                        <Input.Password
                            prefix={<SecurityScanOutlined className="text-slate-500 mr-2" />}
                            placeholder="Enter Secret Admin Key"
                            className="!h-12 !rounded-xl"
                        />
                    </Form.Item>

                    <Form.Item className="mt-8">
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            size="large"
                            className="!h-12 !rounded-xl font-bold text-lg !bg-indigo-600"
                            icon={<ArrowRightOutlined />}
                        >
                            Open Command Center
                        </Button>
                    </Form.Item>
                </Form>
            )
        }
    ];

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="!bg-slate-800/50 !border-white/10 !rounded-3xl !backdrop-blur-xl p-4 sm:p-8 login-card">
                    <div className="text-center mb-10">
                        <Title level={2} className="!text-white !m-0 !font-extrabold">Portal Access</Title>
                        <Text className="text-slate-400">Select your access point to continue</Text>
                    </div>

                    <Tabs
                        defaultActiveKey="college"
                        items={loginItems}
                        className="custom-tabs"
                        centered
                        indicator={{ size: (origin) => origin - 20 }}
                    />

                    <div className="text-center mt-6">
                        <Text className="text-slate-400">
                            Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors">Create one</Link>
                        </Text>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
