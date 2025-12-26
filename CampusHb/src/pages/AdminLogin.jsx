import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Card } from 'antd';
import { SecurityScanOutlined, ArrowRightOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

const AdminLogin = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/admin-login', values);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            message.success('Master Admin Access Granted!');
            navigate('/');
        } catch (err) {
            message.error(err.response?.data?.message || 'Invalid Admin Key. Access Denied.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="!bg-slate-800/70 !border-indigo-500/30 !rounded-3xl !backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-indigo-500/20">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-6 shadow-xl shadow-indigo-500/50"
                        >
                            <SecurityScanOutlined className="text-4xl text-white" />
                        </motion.div>
                        <Title level={1} className="!text-white !m-0 !font-black !text-3xl">
                            Command Center
                        </Title>
                        <Paragraph className="text-slate-400 mt-2 mb-0">
                            Restricted Access - Authorized Personnel Only
                        </Paragraph>
                    </div>

                    {/* Warning Notice */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 flex items-start gap-3">
                        <LockOutlined className="text-amber-400 text-xl mt-0.5" />
                        <div>
                            <Text className="text-amber-300 font-bold block mb-1">Security Notice</Text>
                            <Text className="text-amber-200/70 text-sm">
                                This is a restricted area. Unauthorized access attempts are logged and monitored.
                            </Text>
                        </div>
                    </div>

                    {/* Form */}
                    <Form
                        name="admin-login"
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                    >
                        <Form.Item
                            name="adminKey"
                            label={<span className="text-slate-300 font-bold text-lg">Master Authorization Key</span>}
                            rules={[{ required: true, message: 'Admin Key is required for access' }]}
                        >
                            <Input.Password
                                prefix={<SecurityScanOutlined className="text-indigo-400 mr-2 text-lg" />}
                                placeholder="Enter Secret Admin Key"
                                className="!h-14 !rounded-xl !bg-slate-900/50 !border-indigo-500/30 !text-white"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item className="mt-10 mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                size="large"
                                className="!h-14 !rounded-xl font-bold text-lg !bg-gradient-to-r !from-indigo-600 !to-purple-600 !border-none shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 transition-all"
                                icon={<ArrowRightOutlined />}
                            >
                                {loading ? 'Authenticating...' : 'Access Command Center'}
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <Text className="text-slate-500 text-xs">
                            🔒 All access attempts are encrypted and logged for security purposes
                        </Text>
                    </div>
                </Card>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
