import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AdvancedImage } from '@cloudinary/react';
import { ClassDetails, Enrollment, User } from '@/types';
import { useShow, useList, useCreate, useInvalidate, useUpdate, useGetIdentity } from '@refinedev/core';
import React, { useMemo, useState } from 'react';
import { bannerPhoto } from '@/lib/cloudinary';
import { DataTable } from '@/components/refine-ui/data-table/data-table.tsx';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { DeleteButton } from '@/components/refine-ui/buttons/delete.tsx';
import { Trash2, Loader2, Plus, UserPlus, Copy, RotateCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Progress } from '@/components/ui/progress';
import { UserProfileDialog } from '@/components/user-profile-dialog';
import { toast } from 'sonner';

const Show = () => {
  const { query } = useShow<ClassDetails>({ resource: 'classes' });
  const classDetails = query.data?.data;
  const { isLoading, isError } = query;
  
  const classId = classDetails?.id;
  const invalidate = useInvalidate();
  const { mutate: updateClass } = useUpdate();
  const [isUpdatingClass, setIsUpdatingClass] = useState(false);
  const { data: identity } = useGetIdentity<User>();
  const role = identity?.role || 'guest';

  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);

  // Fetch list of students for enrollment selection dropdown (admins/teachers only)
  const { query: studentsQuery } = useList<User>({
    resource: 'users',
    filters: [{ field: 'role', operator: 'eq', value: 'student' }],
    pagination: { pageSize: 100 },
    queryOptions: {
      enabled: role === 'admin' || role === 'teacher'
    }
  });
  
  // Check if current logged-in student is already enrolled in this class
  const { query: checkEnrollmentQuery } = useList<Enrollment>({
    resource: 'enrollments',
    filters: [
      { field: 'classId', operator: 'eq', value: classId ?? -1 },
      { field: 'studentId', operator: 'eq', value: identity?.id ?? '' }
    ],
    queryOptions: {
      enabled: !!classId && !!identity?.id && role === 'student'
    }
  });

  const isEnrolled = !!(checkEnrollmentQuery?.data?.total && checkEnrollmentQuery.data.total > 0);

  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { mutate: enrollStudent } = useCreate();

  const handleEnroll = () => {
    if(!selectedStudent || !classId) return;
    setIsEnrolling(true);
    enrollStudent({
        resource: 'enrollments',
        values: { classId, studentId: selectedStudent },
        successNotification: () => ({
            message: "Student enrolled successfully",
            type: "success",
            description: "Success"
        }),
    }, {
        onSuccess: () => {
            setSelectedStudent('');
            invalidate({
                resource: 'enrollments',
                invalidates: ['list']
            });
            invalidate({
                resource: 'classes',
                invalidates: ['detail']
            });
        },
        onSettled: () => {
            setIsEnrolling(false);
        }
    });
  };

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinSelectedStudent, setJoinSelectedStudent] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { mutate: joinClass } = useCreate();

  const handleJoin = () => {
      const targetStudentId = role === 'student' ? identity?.id : joinSelectedStudent;
      if(!inviteCodeInput || !targetStudentId) return;
      setIsJoining(true);
      joinClass({
          resource: 'enrollments/join',
          values: { inviteCode: inviteCodeInput, studentId: targetStudentId },
          successNotification: () => ({
              message: "Successfully joined the class",
              type: "success",
              description: "Success"
          })
      }, {
          onSuccess: () => {
              setJoinModalOpen(false);
              setInviteCodeInput('');
              setJoinSelectedStudent('');
              invalidate({ resource: 'enrollments', invalidates: ['list'] });
              invalidate({ resource: 'classes', invalidates: ['detail'] });
          },
          onSettled: () => setIsJoining(false)
      });
  };

  const copyInviteCode = () => {
      if(classDetails?.inviteCode) {
          navigator.clipboard.writeText(classDetails.inviteCode);
          toast.success("Invite code copied to clipboard!");
      }
  };

  const handleRegenerateCode = () => {
      if (!classId) return;
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setIsUpdatingClass(true);
      updateClass({
          resource: 'classes',
          id: classId,
          values: { inviteCode: newCode },
          successNotification: () => ({
              message: "Invite code regenerated successfully",
              type: "success",
              description: "Success"
          })
      }, {
          onSuccess: () => {
              invalidate({
                  resource: 'classes',
                  invalidates: ['detail']
              });
          },
          onSettled: () => {
              setIsUpdatingClass(false);
          }
      });
  };

  const enrollmentColumns = useMemo<ColumnDef<Enrollment>[]>(() => {
      const cols: ColumnDef<Enrollment>[] = [
          {
              id: 'image',
              accessorKey: 'student.image',
              size: 60,
              header: () => <p className="column-title">Img</p>,
              cell: ({ getValue, row }) => {
                  const imgUrl = getValue<string>();
                  const name = row.original.student?.name || 'Student';
                  const initials = name.slice(0,2).toUpperCase();
                  return (
                      <div 
                          className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedUserProfile(row.original.student || null)}
                      >
                          {imgUrl ? <img src={imgUrl} alt={name} className="w-full h-full object-cover" /> : <span className="text-xs font-medium">{initials}</span>}
                      </div>
                  );
              }
          },
          {
              id: 'name',
              accessorKey: 'student.name',
              header: () => <p className="column-title">Name</p>,
              cell: ({ getValue, row }) => (
                  <span 
                      className="text-foreground font-medium hover:underline cursor-pointer"
                      onClick={() => setSelectedUserProfile(row.original.student || null)}
                  >
                      {getValue<string>()}
                  </span>
              ),
          },
          {
              id: 'email',
              accessorKey: 'student.email',
              header: () => <p className="column-title">Email</p>,
              cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
          }
      ];

      if (role === 'admin' || role === 'teacher') {
          cols.push({
              id: 'actions',
              size: 80,
              header: () => <p className="column-title text-center">Actions</p>,
              cell: ({ row }) => (
                  <div className="flex justify-center">
                      <DeleteButton resource="enrollments" recordItemId={row.original.id} variant="ghost" size="icon" title="Unenroll">
                          <Trash2 className="h-4 w-4 text-destructive" />
                      </DeleteButton>
                  </div>
              )
          });
      }

      return cols;
  }, [role]);

  const enrollmentsTable = useTable<Enrollment>({
      columns: enrollmentColumns,
      refineCoreProps: {
          resource: 'enrollments',
          pagination: { pageSize: 10, mode: 'server' },
          filters: {
              permanent: [
                  { field: 'classId', operator: 'eq', value: classId ?? -1 }
              ]
          },
          queryOptions: {
              enabled: !!classId
          }
      }
  });

  if (isLoading || isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title='Class Details' />
        <p className="state-message">
          {isLoading ? 'Loading class details...'
            : isError ? 'Error loading class details.'
              : 'Class details not found'}
        </p>
      </ShowView>
    );
  }

  const teacherName = classDetails.teacher?.name ?? 'N/A';
  const teachersInitials =
    teacherName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

  const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(teachersInitials || 'N/A')}`;

  const {
    name,
    description,
    status,
    capacity,
    bannerUrl,
    subject,
    teacher,
    department,
    bannerCldPubId,
    inviteCode
  } = classDetails;

  const totalEnrolled = enrollmentsTable.refineCore.tableQuery.data?.total || 0;
  const isFull = totalEnrolled >= capacity;
  const fillPercentage = Math.min(100, (totalEnrolled / capacity) * 100);
  const isClassTeacherOrAdmin = role === 'admin' || (role === 'teacher' && classDetails.teacher?.id === identity?.id);

  return (
    <ShowView className="class-view class-show">
      <ShowViewHeader resource="classes" title='Class Details' />

      <div className="banner">
        {bannerUrl && bannerCldPubId ? (
          <AdvancedImage alt="Class Banner" cldImg={bannerPhoto(bannerCldPubId, name)} />
        ) : <div className="placeholder" />}
      </div>

      <Card className="details-card mb-8">
        <div className="details-header flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{name}</h1>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status === 'active' ? "default" : "secondary"}>
              {status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Capacity Progress Bar Section */}
        <div className="mt-6 space-y-2 border rounded-xl p-4 bg-muted/20">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-muted-foreground">Class Roster Capacity</span>
            <span className="font-semibold">{totalEnrolled} / {capacity} spots filled</span>
          </div>
          <Progress 
            value={fillPercentage} 
            className={`h-2 [&>[data-slot=progress-indicator]]:transition-all ${
              isFull ? '[&>[data-slot=progress-indicator]]:bg-destructive' :
              fillPercentage >= 80 ? '[&>[data-slot=progress-indicator]]:bg-orange-500' :
              '[&>[data-slot=progress-indicator]]:bg-emerald-500'
            }`}
          />
          {isFull && (
            <Badge variant="destructive" className="w-full justify-center py-1">Class is Full</Badge>
          )}
        </div>

        <div className="details-grid mt-6">
          <div className="instructor">
            <p>Instructor</p>
            <div className="flex items-center gap-3 mt-2">
              <img src={teacher?.image ?? placeholderUrl}
                alt={teacherName} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p 
                  className="font-semibold text-foreground hover:underline cursor-pointer"
                  onClick={() => setSelectedUserProfile(teacher || null)}
                >
                  {teacherName}
                </p>
                <p className="text-sm text-muted-foreground">{teacher?.email ?? 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="department">
            <p>Department</p>
            <div className="mt-2">
              <p className="font-semibold text-foreground">{department?.name || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{department?.description || 'No description available.'}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        <div className="subject">
          <p>Subject</p>
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">Code: {subject?.code || 'N/A'}</Badge>
              <p className="font-semibold text-foreground">{subject?.name}</p>
            </div>
            <p className="text-sm text-muted-foreground">{subject?.description}</p>
          </div>
        </div>

        <Separator className="my-6" />
        <div className="join">
          <div className="flex justify-between items-center w-full flex-wrap gap-2">
              <h2>Invite Code & Joining</h2>
              <div className="flex items-center gap-2">
                  {inviteCode && (
                      <Badge variant="secondary" className="flex items-center gap-2 cursor-pointer py-1.5 px-3" onClick={copyInviteCode}>
                          Code: {inviteCode} <Copy className="w-3.5 h-3.5" />
                      </Badge>
                  )}
                  {isClassTeacherOrAdmin && (
                      <Button variant="outline" size="sm" onClick={handleRegenerateCode} disabled={isUpdatingClass} className="gap-1.5">
                          <RotateCw className={`w-3.5 h-3.5 ${isUpdatingClass ? 'animate-spin' : ''}`} />
                          Regenerate Code
                      </Button>
                  )}
              </div>
          </div>
          
          <div className="mt-4">
              {role === 'student' && isEnrolled ? (
                  <div className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                      </div>
                      <div>
                          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">You are enrolled</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">You are currently a student in this class.</p>
                      </div>
                  </div>
              ) : role === 'student' ? (
                  <div className="space-y-4">
                      <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Ask your instructor for the active class invite code.</li>
                          <li>Click the "Join Class" button below.</li>
                          <li>Submit the code to enroll instantly.</li>
                      </ol>
                      
                      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
                          <DialogTrigger asChild>
                              <Button size="lg" className="w-full" disabled={isFull}>
                                  {isFull ? 'Class is Full' : 'Join Class'}
                              </Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>Join Class with Invite Code</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                      <p className="text-sm font-medium">Invite Code</p>
                                      <Input value={inviteCodeInput} onChange={e => setInviteCodeInput(e.target.value)} placeholder="e.g. X9F2A1" className="uppercase" />
                                  </div>
                                  <Button onClick={handleJoin} disabled={!inviteCodeInput || isJoining} className="w-full">
                                      {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Class'}
                                  </Button>
                              </div>
                          </DialogContent>
                      </Dialog>
                  </div>
              ) : (
                  <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Students can join using the invite code above.</p>
                  </div>
              )}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <Card className="shadow-sm">
              <CardHeader>
                  <CardTitle>Enrolled Students</CardTitle>
              </CardHeader>
              <CardContent>
                  <DataTable table={enrollmentsTable} />
              </CardContent>
          </Card>

          {/* Hide enrollment widget for students */}
          {(role === 'admin' || role === 'teacher') && (
              <Card className="h-fit shadow-sm">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5"/> Enroll Student</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Select a student from the list to enroll them directly into this class.</p>
                          <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={studentsQuery.isLoading || isFull}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select student..." />
                              </SelectTrigger>
                              <SelectContent>
                                  {studentsQuery.data?.data?.map(student => (
                                      <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>
                      
                      {isFull && (
                          <p className="text-xs text-destructive font-medium text-center">
                              This class has reached its maximum capacity.
                          </p>
                      )}
                      
                      <Button onClick={handleEnroll} disabled={!selectedStudent || isEnrolling || isFull} className="w-full">
                          {isEnrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : isFull ? 'Class is Full' : 'Enroll Now'}
                      </Button>
                  </CardContent>
              </Card>
          )}
      </div>

      {/* User Details Popup */}
      <UserProfileDialog 
          user={selectedUserProfile} 
          open={selectedUserProfile !== null} 
          onOpenChange={(open) => !open && setSelectedUserProfile(null)} 
      />
    </ShowView>
  );
};

export default Show;

