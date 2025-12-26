import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
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

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="!bg-slate-800/50 !border-white/10 !rounded-3xl !backdrop-blur-xl p-4 sm:p-8 login-card">
                    <div className="text-center mb-10">
                        <Title level={2} className="!text-white !m-0 !font-extrabold">College Portal</Title>
                        <Text className="text-slate-400">Sign in to access your account</Text>
                    </div>

                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
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
