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
        <nav className="sticky top-0 z-50 px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                        <GraduationCap className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold gradient-text">CampusHB</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {user.role === 'admin' && (
                                <Link to="/admin-dashboard">
                                    <Button type="text" className="text-slate-300 hover:text-indigo-400 font-medium">
                                        <AppstoreOutlined /> Admin Panel
                                    </Button>
                                </Link>
                            )}
                            <Dropdown menu={{ items }} placement="bottomRight" arrow>
                                <Space className="cursor-pointer group">
                                    <div className="text-right hidden sm:flex flex-col items-end">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-200 leading-none m-0">{user.name}</p>
                                            <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30 font-black uppercase tracking-tighter">
                                                {user.role}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider truncate max-w-[180px]">
                                            {user.collegeName || 'System HQ'}
                                        </p>
                                    </div>
                                    <Avatar
                                        style={{ backgroundColor: '#6366f1' }}
                                        icon={<UserOutlined />}
                                        className="border-2 border-indigo-400/30 group-hover:border-indigo-400 transition-colors"
                                    />
                                </Space>
                            </Dropdown>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/login">
                                <Button type="text" className="text-slate-300 font-medium hover:text-white">Login</Button>
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
