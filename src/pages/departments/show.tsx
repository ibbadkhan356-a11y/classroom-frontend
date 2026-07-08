import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Department, Subject } from '@/types';
import { useShow } from '@refinedev/core';

type DepartmentDetails = Department & {
    subjects: Subject[];
};

const DepartmentsShow = () => {
    const { query } = useShow<DepartmentDetails>({ resource: 'departments' });

    const departmentDetails = query.data?.data;
    const { isLoading, isError } = query;

    if (isLoading || isError || !departmentDetails) {
        return (
            <ShowView className="class-view class-show">
                <ShowViewHeader resource="departments" title='Department Details' />
                <p className="state-message">
                    {isLoading ? 'Loading department details...'
                        : isError ? 'Error loading department details.'
                            : 'Department details not found'}
                </p>
            </ShowView>
        );
    }

    const { code, name, description, subjects } = departmentDetails;

    return (
        <ShowView className="class-view class-show">
            <ShowViewHeader resource="departments" title='Department Details' />

            <Card className="details-card">
                <div className="details-header">
                    <div>
                        <h1>{name}</h1>
                        <p>{description}</p>
                    </div>
                    <div>
                        <Badge variant="outline">{subjects?.length || 0} subjects</Badge>
                        <Badge variant="default" className="ml-2">CODE: {code}</Badge>
                    </div>
                </div>

                {subjects && subjects.length > 0 ? (
                    <div className="details-grid">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="department">
                                <p>Subject • {subject.code}</p>
                                <div>
                                    <p>{subject.name}</p>
                                    <p>{subject.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <Separator className="mt-8" />
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg mt-8">
                            No subjects assigned to this department yet.
                        </div>
                    </>
                )}
            </Card>
        </ShowView>
    );
};

export default DepartmentsShow;
