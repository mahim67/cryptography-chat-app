import clsx from 'clsx';
import { MessageSquare, Bell, Settings, Star, Archive } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { NavUser } from './nav-user';

const SidebarIcon = ({ icon: Icon, active }) => (
    <div className={clsx("p-2 rounded-lg hover:bg-muted", active && "bg-muted")}>
        <Icon className={`h-6 w-6 hover:text-green-700 ${active ? "text-green-700" : "text-white"}`} />
    </div>
);

export default function Sidebar() {
    return (
        <aside className="w-16 h-screen bg-green-700 flex flex-col items-center justify-between py-4">
            <div className="space-y-4">
                <SidebarIcon icon={MessageSquare} active />
                <SidebarIcon icon={Star} />
                <SidebarIcon icon={Archive} />
            </div>
            <div className='flex flex-col items-center justify-between space-y-4'>
                <SidebarIcon icon={Bell} />
                <SidebarIcon icon={Settings} />
                <Separator className="mb-6" />
                <NavUser />
            </div>
        </aside>
    );
}
