import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ClassDetails, Subject } from '@/types';
import { useShow, useList } from '@refinedev/core';

const SubjectsShow = () => {
    const { query } = useShow<Subject>({ resource: 'subjects' });

    const subjectDetails = query.data?.data;
    const { isLoading, isError } = query;

    const { query: classesQuery } = useList<ClassDetails>({
        resource: 'classes',
        filters: [
            { field: 'subjectId', operator: 'eq', value: subjectDetails?.id }
        ],
        queryOptions: {
            enabled: !!subjectDetails?.id
        }
    });

    const classesLoading = classesQuery.isLoading;
    const classesList = classesQuery.data?.data || [];

    if (isLoading || isError || !subjectDetails) {
        return (
            <ShowView className="class-view class-show">
                <ShowViewHeader resource="subjects" title='Subject Details' />
                <p className="state-message">
                    {isLoading ? 'Loading subject details...'
                        : isError ? 'Error loading subject details.'
                            : 'Subject details not found'}
                </p>
            </ShowView>
        );
    }

    const { code, name, description, department } = subjectDetails;

    return (
        <ShowView className="class-view class-show">
            <ShowViewHeader resource="subjects" title='Subject Details' />

            <Card className="details-card">
                <div className="details-header">
                    <div>
                        <h1>{name}</h1>
                        <p>{description}</p>
                    </div>
                    <div>
                        <Badge variant="outline">{department?.name || 'No Dept'}</Badge>
                        <Badge variant="default" className="ml-2">CODE: {code}</Badge>
                    </div>
                </div>

                {classesLoading ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg mt-8">
                        Loading related classes...
                    </div>
                ) : classesList.length > 0 ? (
                    <div className="details-grid mt-8">
                        {classesList.map((cls) => (
                            <div key={cls.id} className="department">
                                <p>Class • {cls.status}</p>
                                <div>
                                    <p>{cls.name}</p>
                                    <p className="text-sm text-muted-foreground mt-1">Capacity: {cls.capacity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <Separator className="mt-8" />
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg mt-8">
                            No classes assigned to this subject yet.
                        </div>
                    </>
                )}
            </Card>
        </ShowView>
    );
};

export default SubjectsShow;
