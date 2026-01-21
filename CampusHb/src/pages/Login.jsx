import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getApiUrl } from '../config/api';

const { Title, Text } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post(getApiUrl('auth/login'), values);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            message.success('Welcome back to CampusHB!');
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            const errorField = err.response?.data?.field;

            // Show general error message
            message.error(errorMessage);

            // Highlight the specific field with error
            if (errorField) {
                form.setFields([{
                    name: errorField,
                    errors: [errorMessage],
                }]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-violet-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card className="!bg-white !border-gray-200 !rounded-2xl shadow-lg p-4 sm:p-8">
                    <div className="text-center mb-10">
                        <Title level={2} className="!text-gray-900 !m-0 !font-extrabold">College Portal</Title>
                        <Text className="text-gray-600">Sign in to access your account</Text>
                    </div>

                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                    >
                        <Form.Item
                            name="email"
                            label={<span className="text-gray-700 font-medium">Email Address</span>}
                            rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                        >
                            <Input
                                prefix={<MailOutlined className="text-gray-400 mr-2" />}
                                placeholder="name@college.edu"
                                className="!h-12 !rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span className="text-gray-700 font-medium">Password</span>}
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400 mr-2" />}
                                placeholder="••••••••"
                                className="!h-12 !rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item className="mt-8">
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                size="large"
                                className="!h-12 !rounded-lg font-bold text-lg"
                                icon={<ArrowRightOutlined />}
                            >
                                Login to Portal
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center mt-6">
                        <Text className="text-gray-600">
                            Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors">Create one</Link>
                        </Text>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
