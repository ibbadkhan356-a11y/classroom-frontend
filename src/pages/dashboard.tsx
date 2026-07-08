import React, { useMemo } from "react";
import { useList, useGetIdentity, useCreate, useInvalidate } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router";
import { Users, Building2, BookOpen, GraduationCap, ArrowUpRight, Loader2 } from "lucide-react";
import { User, ClassDetails, Department, Subject } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Input } from "@/components/ui/input.tsx";
import { UserProfileDialog } from "@/components/user-profile-dialog";

const Dashboard = () => {
    const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();
    const role = identity?.role || "guest";
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

    const { mutate: joinClass } = useCreate();
    const invalidate = useInvalidate();
    const [inviteCode, setInviteCode] = React.useState("");
    const [isJoining, setIsJoining] = React.useState(false);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode || !identity?.id) return;
        setIsJoining(true);
        joinClass({
            resource: "enrollments/join",
            values: { inviteCode, studentId: identity.id },
            successNotification: () => ({
                message: "Successfully joined the class",
                type: "success",
                description: "Success"
            })
        }, {
            onSuccess: () => {
                setInviteCode("");
                invalidate({ resource: 'classes', invalidates: ['list'] });
                invalidate({ resource: 'enrollments', invalidates: ['list'] });
            },
            onSettled: () => {
                setIsJoining(false);
            }
        });
    };

    // 1. Core Data Queries
    const { query: usersQuery } = useList<User>({
        resource: "users",
        pagination: { pageSize: 1000 },
        queryOptions: { enabled: role === "admin" }
    });
    const allUsersData = usersQuery?.data;
    const allUsersLoading = usersQuery?.isLoading;

    const { query: deptsQuery } = useList<Department>({
        resource: "departments",
        pagination: { pageSize: 1000 },
    });
    const deptsData = deptsQuery?.data;
    const deptsLoading = deptsQuery?.isLoading;

    const { query: classesQuery } = useList<ClassDetails>({
        resource: "classes",
        pagination: { pageSize: 1000 },
    });
    const allClassesData = classesQuery?.data;
    const allClassesLoading = classesQuery?.isLoading;

    const { query: subjsQuery } = useList<Subject>({
        resource: "subjects",
        pagination: { pageSize: 5 },
    });
    const subjsData = subjsQuery?.data;
    const subjsLoading = subjsQuery?.isLoading;

    const { query: enrollsQuery } = useList({
        resource: "enrollments",
        pagination: { pageSize: 1 },
    });
    const enrollsData = enrollsQuery?.data;
    const enrollsLoading = enrollsQuery?.isLoading;

    // 2. Filtered User Queries (for Admin lists)
    const { query: teachersQuery } = useList<User>({
        resource: "users",
        filters: role === "admin" ? [{ field: "role", operator: "eq", value: "teacher" }] : undefined,
        pagination: { pageSize: 5 },
        queryOptions: { enabled: role === "admin" }
    });
    const teachersList = teachersQuery?.data?.data || [];
    const teachersLoading = teachersQuery?.isLoading;

    const { query: studentsQuery } = useList<User>({
        resource: "users",
        filters: role === "admin" ? [{ field: "role", operator: "eq", value: "student" }] : undefined,
        pagination: { pageSize: 5 },
        queryOptions: { enabled: role === "admin" }
    });
    const studentsList = studentsQuery?.data?.data || [];
    const studentsLoading = studentsQuery?.isLoading;

    // 3. Memoized Chart Data
    const roleDistribution = useMemo(() => {
        if (!allUsersData?.data) return [];
        const counts = { student: 0, teacher: 0, admin: 0 };
        allUsersData.data.forEach(user => {
            if (user.role in counts) counts[user.role as keyof typeof counts]++;
        });
        return [
            { name: 'Students', value: counts.student, fill: 'var(--chart-1)' },
            { name: 'Teachers', value: counts.teacher, fill: 'var(--chart-2)' },
            { name: 'Admins', value: counts.admin, fill: 'var(--chart-3)' },
        ];
    }, [allUsersData]);

    const classesPerDept = useMemo(() => {
        if (!allClassesData?.data) return [];
        const counts: Record<number, number> = {};
        allClassesData.data.forEach(cls => {
            const deptId = cls.subject?.departmentId ?? cls.subject?.department?.id;
            if (deptId !== undefined && deptId !== null) {
                counts[deptId] = (counts[deptId] || 0) + 1;
            }
        });

        const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
        
        return Object.entries(counts).map(([deptId, count], index) => {
            const dept = deptsData?.data.find(d => d.id === parseInt(deptId));
            return {
                name: dept?.name || `Dept ${deptId}`,
                value: count,
                color: COLORS[index % COLORS.length]
            };
        });
    }, [allClassesData, deptsData]);

    const studentTeachers = useMemo(() => {
        if (!allClassesData?.data) return [];
        const tMap = new Map<string, User>();
        allClassesData.data.forEach(cls => {
            if (cls.teacher) {
                tMap.set(cls.teacher.id, cls.teacher as User);
            }
        });
        return Array.from(tMap.values());
    }, [allClassesData]);

    // 4. Header Stats Definition
    const stats = role === 'student' ? [
        { title: "My Classes", value: allClassesData?.total || 0, icon: GraduationCap, loading: allClassesLoading, visible: true },
        { title: "My Departments", value: deptsData?.total || 0, icon: Building2, loading: deptsLoading, visible: true },
        { title: "My Teachers", value: studentTeachers.length, icon: Users, loading: allClassesLoading, visible: true },
    ] : [
        { title: "Total Subjects", value: subjsData?.total || 0, icon: BookOpen, loading: subjsLoading, visible: true },
        { title: "Total Classes", value: allClassesData?.total || 0, icon: GraduationCap, loading: allClassesLoading, visible: true },
        { title: "Enrolled Students", value: enrollsData?.total || 0, icon: Users, loading: enrollsLoading, visible: true },
        { title: "Total Departments", value: deptsData?.total || 0, icon: Building2, loading: deptsLoading, visible: role === "admin" || role === "teacher" },
    ].filter(s => s.visible);

    // Initial fallback helper for avatars
    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    if (isIdentityLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            {/* Top Welcome Banner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-2 border-b">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back, <span className="font-semibold text-foreground">{identity?.name || "User"}</span> ({role})! Here is your classroom system overview.
                    </p>
                </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {stat.loading ? (
                                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Grid Section */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
                {/* Left Column: Subjects & Classes Tables */}
                <div className="col-span-1 lg:col-span-4 space-y-6">
                    {/* Subjects Table */}
                    {role !== "student" && (
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-lg">Recent Subjects</CardTitle>
                                <CardDescription>Latest subjects active in curriculum.</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="gap-1">
                                <Link to="/subjects">
                                    View All <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {subjsLoading ? (
                                <div className="space-y-2 py-4">
                                    <div className="h-8 bg-muted animate-pulse rounded" />
                                    <div className="h-8 bg-muted animate-pulse rounded" />
                                    <div className="h-8 bg-muted animate-pulse rounded" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Code</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subjsData?.data.map((subj) => (
                                            <TableRow key={subj.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono text-xs">{subj.code}</Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{subj.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {subj.department?.name || "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link to={`/subjects/show/${subj.id}`}>View</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(!subjsData?.data || subjsData.data.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                                    No subjects available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    )}

                    {/* Classes Table */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-lg">Recent Classes</CardTitle>
                                <CardDescription>Active classes with teacher details.</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="gap-1">
                                <Link to="/classes">
                                    View All <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {allClassesLoading ? (
                                <div className="space-y-2 py-4">
                                    <div className="h-8 bg-muted animate-pulse rounded" />
                                    <div className="h-8 bg-muted animate-pulse rounded" />
                                    <div className="h-8 bg-muted animate-pulse rounded" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Class Name</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Teacher</TableHead>
                                            <TableHead>Capacity</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allClassesData?.data.slice(0, 5).map((cls) => (
                                            <TableRow key={cls.id} className="hover:bg-muted/50 whitespace-nowrap">
                                                <TableCell className="font-medium">{cls.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{cls.subject?.name || "N/A"}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={cls.teacher?.image || undefined} />
                                                            <AvatarFallback className="text-[10px]">{getInitials(cls.teacher?.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-medium">{cls.teacher?.name || "Unknown"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm font-mono">{cls.capacity}</TableCell>
                                                <TableCell>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link to={`/classes/show/${cls.id}`}>View</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {(!allClassesData?.data || allClassesData.data.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                                    No classes available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Charts & User Lists */}
                <div className="col-span-1 lg:col-span-3 space-y-6">
                    {role === "student" && (
                        <>
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">My Departments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {deptsData?.data.map(dept => (
                                            <div key={dept.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {dept.code}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{dept.name}</p>
                                                    </div>
                                                </div>
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link to={`/departments/show/${dept.id}`}>View</Link>
                                                </Button>
                                            </div>
                                        ))}
                                        {(!deptsData?.data || deptsData.data.length === 0) && (
                                            <p className="text-sm text-muted-foreground text-center py-4">No departments found.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">My Teachers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {studentTeachers.map(teacher => (
                                            <div key={teacher.id} className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md" onClick={() => setSelectedUser(teacher)}>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 border">
                                                        <AvatarImage src={teacher.image || undefined} />
                                                        <AvatarFallback className="text-[10px]">{getInitials(teacher.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{teacher.name}</p>
                                                        <p className="text-xs text-muted-foreground">{teacher.email}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px]">Teacher</Badge>
                                            </div>
                                        ))}
                                        {studentTeachers.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">No teachers found.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Visual Charts Card (Admin & Teacher) */}
                    {(role === "admin" || role === "teacher") && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">System Insights</CardTitle>
                                <CardDescription>Breakdown of system users & departments.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Bar Chart */}
                                <div className="h-[200px] w-full min-w-0">
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">User Distribution</h4>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <BarChart data={roleDistribution}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" stroke="var(--muted-foreground)" />
                                            <YAxis axisLine={false} tickLine={false} className="text-xs" stroke="var(--muted-foreground)" />
                                            <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)', borderRadius: '8px', borderColor: 'var(--border)' }} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Pie Chart */}
                                <div className="h-[280px] w-full min-w-0 border-t pt-4">
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Classes by Department</h4>
                                    <ResponsiveContainer width="100%" height="85%">
                                        <PieChart>
                                            <Pie
                                                data={classesPerDept}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={40}
                                                outerRadius={60}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {classesPerDept.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)', borderRadius: '8px', borderColor: 'var(--border)' }} />
                                            <Legend verticalAlign="bottom" iconType="circle" className="text-[10px]" wrapperStyle={{ color: 'var(--foreground)', paddingTop: '10px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Teachers List (Admin Only) */}
                    {role === "admin" && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Teachers</CardTitle>
                                <CardDescription>Quick view of teaching staff.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {teachersLoading ? (
                                    <div className="h-20 bg-muted animate-pulse rounded" />
                                ) : (
                                    teachersList.slice(0, 4).map((teacher) => (
                                        <div key={teacher.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={teacher.image || undefined} />
                                                    <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold">{teacher.name}</p>
                                                    <p className="text-xs text-muted-foreground">@{teacher.email.split("@")[0]}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(teacher)}>
                                                View
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Students List (Admin Only) */}
                    {role === "admin" && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Students</CardTitle>
                                <CardDescription>Quick view of student accounts.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {studentsLoading ? (
                                    <div className="h-20 bg-muted animate-pulse rounded" />
                                ) : (
                                    studentsList.slice(0, 4).map((student) => (
                                        <div key={student.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={student.image || undefined} />
                                                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">@{student.email.split("@")[0]}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(student)}>
                                                View
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Student-Facing Join Class Card */}
                    {role === "student" && (
                        <Card className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Join a Class</CardTitle>
                                <CardDescription>Enter a class invite code to enroll in a new class.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleJoin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Enter invite code (e.g. X9F2A1)"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value)}
                                            className="uppercase w-full font-mono text-center tracking-widest text-lg py-5"
                                            maxLength={8}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={!inviteCode || isJoining}>
                                        {isJoining ? (
                                            <div className="flex gap-1 items-center justify-center">
                                                <span>Joining...</span>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        ) : (
                                            "Join Class"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Shared User Profile Dialog */}
            <UserProfileDialog 
                user={selectedUser} 
                open={selectedUser !== null} 
                onOpenChange={(open) => !open && setSelectedUser(null)} 
            />
        </div>
    );
};

export default Dashboard;
