import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Avatar, Dropdown, Space } from 'antd';
import { LogoutOutlined, UserOutlined, AppstoreOutlined } from '@ant-design/icons';
import { GraduationCap } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const items = [
        {
            key: '1',
            label: (
                <div onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                    <LogoutOutlined />
                    <span>Logout</span>
                </div>
            ),
        },
    ];

    return (
        <nav className="sticky top-0 z-50 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                        <GraduationCap className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold gradient-text">CampusHB</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {user.role === 'admin' && (
                                <Link to="/admin-dashboard">
                                    <Button type="text" className="text-gray-700 hover:text-blue-600 font-medium">
                                        <AppstoreOutlined /> Admin Panel
                                    </Button>
                                </Link>
                            )}
                            <Dropdown menu={{ items }} placement="bottomRight" arrow>
                                <Space className="cursor-pointer group">
                                    <div className="text-right hidden sm:flex flex-col items-end">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-gray-900 leading-none m-0">{user.name}</p>
                                            <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200 font-bold uppercase tracking-tight">
                                                {user.role}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider truncate max-w-[180px]">
                                            {user.collegeName || 'System HQ'}
                                        </p>
                                    </div>
                                    <Avatar
                                        style={{ backgroundColor: '#2563eb' }}
                                        icon={<UserOutlined />}
                                        className="border-2 border-blue-200 group-hover:border-blue-400 transition-colors"
                                    />
                                </Space>
                            </Dropdown>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/login">
                                <Button type="text" className="text-gray-700 font-medium hover:text-blue-600">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button type="primary" className="rounded-lg">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
