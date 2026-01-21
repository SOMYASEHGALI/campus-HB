import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Card, Select, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, BankOutlined, SecurityScanOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getApiUrl } from '../config/api';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [showOtherCollege, setShowOtherCollege] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const colleges = [
        'IIT Roorkee',
        'JECRC',
        'Manipal Institute of Technology',
        'Global Institute of Technology',
        'BITS Mesra',
        'Poornima',
        'Gyan Vihar',
        'Jaipur National University',
        'Other'
    ];

    const handleCollegeChange = (value) => {
        if (value === 'Other') {
            setShowOtherCollege(true);
            form.setFieldsValue({ collegeName: '' });
        } else {
            setShowOtherCollege(false);
            form.setFieldsValue({ collegeName: value });
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post(getApiUrl('auth/register'), values);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            message.success('Account created successfully! Welcome to CampusHB.');
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed.';
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
        <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-blue-50 via-white to-violet-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <Card className="!bg-white !border-gray-200 !rounded-2xl shadow-lg p-4 sm:p-10">
                    <div className="text-center mb-10">
                        <Title level={1} className="!text-gray-900 !m-0 !font-extrabold !text-4xl">Get Started</Title>
                        <Text className="text-gray-600 text-lg">Our platform empowers students and placement cells by increasing the opportunities for them</Text>
                    </div>

                    <Form
                        name="register"
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <Form.Item
                                name="name"
                                label={<span className="text-gray-700 font-medium">Your Name</span>}
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input prefix={<UserOutlined className="text-gray-400 mr-2" />} placeholder="John Doe" className="!h-12 !rounded-lg" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label={<span className="text-gray-700 font-medium">Work Email</span>}
                                rules={[{ required: true, message: 'Required' }, { type: 'email' }]}
                            >
                                <Input prefix={<MailOutlined className="text-gray-400 mr-2" />} placeholder="name@college.edu" className="!h-12 !rounded-lg" />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="collegeSelector"
                            label={<span className="text-gray-700 font-medium">Select Your Institution</span>}
                            rules={[{ required: true, message: 'Please select your institution' }]}
                        >
                            <Select
                                className="!h-12 !rounded-lg"
                                placeholder="Choose your college/university"
                                onChange={handleCollegeChange}
                            >
                                {colleges.map((college) => (
                                    <Option key={college} value={college}>
                                        {college}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {showOtherCollege && (
                            <Form.Item
                                name="collegeName"
                                label={<span className="text-gray-700 font-medium">Enter Institution Name</span>}
                                rules={[{ required: true, message: 'Please enter your college name' }]}
                            >
                                <Input
                                    prefix={<BankOutlined className="text-gray-400 mr-2" />}
                                    placeholder="e.g. Indian Institute of Technology"
                                    className="!h-12 !rounded-lg"
                                />
                            </Form.Item>
                        )}

                        {!showOtherCollege && (
                            <Form.Item
                                name="collegeName"
                                hidden
                            >
                                <Input />
                            </Form.Item>
                        )}

                        <Form.Item
                            name="role"
                            label={<span className="text-gray-700 font-medium">I am a...</span>}
                            rules={[{ required: true, message: 'Please select your role' }]}
                        >
                            <Select className="!h-12 !rounded-lg" placeholder="Select your role">
                                <Option value="student">Student</Option>
                                <Option value="staff">College Staff / TPO</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span className="text-gray-700 font-medium">Password</span>}
                            rules={[{ required: true, min: 6 }]}
                        >
                            <Input.Password prefix={<LockOutlined className="text-gray-400 mr-2" />} placeholder="Minimum 6 characters" className="!h-12 !rounded-lg" />
                        </Form.Item>

                        <Divider className="!border-gray-200" />

                        <Form.Item className="mt-8">
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                className="!h-14 !rounded-xl font-bold text-lg"
                            >
                                Create Professional Account
                            </Button>
                        </Form.Item>

                        <div className="text-center">
                            <Text className="text-gray-600">
                                Already registered? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold ml-1">Log in here</Link>
                            </Text>
                        </div>
                    </Form>
                </Card>
            </motion.div>
        </div>
    );
};

export default Register;
