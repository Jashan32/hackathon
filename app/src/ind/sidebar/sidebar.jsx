import { useNavigate } from "react-router-dom";
import { useState } from "react";
import projectsSVG from "../../../assets/projects.svg";
import homeSVG from "../../../assets/home.svg";
import scheduleSVG from "../../../assets/schedule.svg";
import { Briefcase, LogOut, PanelLeftClose, PanelRightOpen, Settings, Star } from 'lucide-react';
import { useLocation } from "react-router-dom";

export default function IndSidebar() {
    const navigate = useNavigate();
    const [isSidebarClosed, setIsSidebarClosed] = useState(localStorage.getItem('isSidebarClosed') == 'true');
    const profilePicUrl = localStorage.getItem('profilePic') || '';
    const location = useLocation();
    const dashboardPath = location.pathname.toLowerCase().split('/dashboard/')[1];
    const currentTab = dashboardPath ? dashboardPath.split('/').pop() : '';
    
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('profilePic');
        navigate('/auth');
    };
    
    console.log("currentTab", currentTab);
    console.log("dashboardPath", dashboardPath);
    console.log(isSidebarClosed)
    return (
        <div className={` flex flex-col justify-between m-[8px] mr-0 ${isSidebarClosed ? " w-[68px] min-w-[68px]" : "min-w-[232px] w-[232px]"}`}>
            <div className={` text-white flex flex-col gap-[12px] transition-all duration-300 ${isSidebarClosed ? " w-[68px] min-w-[68px]" : "min-w-[232px] w-[232px]"} h-[100vh] `}>
                <div className={`text-lg font-bold h-[40px] flex items-center ${isSidebarClosed ? "justify-center ml-[0px]" : "justify-between ml-[12px]"}`}>
                    {!isSidebarClosed && <div>SkillNest</div>}
                    <div className="flex hover:bg-[#1d1d1d] rounded-[8px] cursor-pointer" onClick={() => { setIsSidebarClosed(!isSidebarClosed); localStorage.setItem('isSidebarClosed', `${!isSidebarClosed}`) }}>
                        {isSidebarClosed ? <PanelRightOpen className="size-[32px] p-[6px] text-[#888888] hover:text-white cursor-pointer rotate-180" /> :
                            <PanelLeftClose className="size-[32px] p-[6px] text-[#888888] hover:text-white cursor-pointer" />}
                    </div>
                </div>
                <div>
                    <div className={`flex flex-col gap-[4px] [&>div]:flex [&>div]:gap-[8px] [&>div]:items-center [&>div]:hover:bg-[#1d1d1d] [&>div]:cursor-pointer [&>div]:rounded-[8px] ${isSidebarClosed ? "[&>div]:h-[68px]" : "[&>div]:h-[40px]"} [&>div]:py-[12px] [&>div]:px-[16px]`}>
                        <div className={`${isSidebarClosed ? "flex flex-col" : ""} ${currentTab === "courses" ? "bg-[#1d1d1d]" : ""}`}
                            onClick={() => navigate("/dashboard/ind/courses")}>
                            <Briefcase className={`${isSidebarClosed ? "size-[20px]" : "size-[24px]"} text-white`} />
                            <div className={`${isSidebarClosed ? "text-[10px]" : "text-[14px]"} font-medium`}>Courses</div>
                        </div>
                        <div className={`${isSidebarClosed ? "flex flex-col" : ""} ${currentTab === "ratings" ? "bg-[#1d1d1d]" : ""}`}
                            onClick={() => navigate("/dashboard/ind/ratings")}>
                            <Star className="size-[24px] text-white" />
                            <div className={`${isSidebarClosed ? "text-[10px]" : "text-[14px]"} font-medium`}>My Ratings</div>
                        </div>
                    </div>
                    <div>

                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <div className={`py-[8px] px-[16px] hover:bg-[#1d1d1d] rounded-[8px] ${isSidebarClosed ? "flex flex-col" : ""} ${currentTab === "settings" ? "bg-[#1d1d1d]" : ""}`}
                    onClick={() => navigate("/dashboard/ind/settings")}>
                    <div className={`${isSidebarClosed ? "flex flex-col" : "flex gap-[8px]"} cursor-pointer items-center`}>
                        <div>
                            <Settings className="size-[24px] text-white" />
                        </div>
                        <div className={`text-white ${isSidebarClosed ? "text-[10px]" : "text-[14px]"} font-medium`}>Settings</div>
                    </div>
                </div>
                <div className={`py-[8px] px-[16px] hover:bg-[#1d1d1d] rounded-[8px] ${isSidebarClosed ? "flex flex-col" : ""}`}
                    onClick={handleLogout}>
                    <div className={`${isSidebarClosed ? "flex flex-col" : "flex gap-[8px]"} cursor-pointer items-center`}>
                        <div>
                            <LogOut className="size-[24px] text-red-400" />
                        </div>
                        <div className={`text-red-400 ${isSidebarClosed ? "text-[10px]" : "text-[14px]"} font-medium`}>Log Out</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
