import { EditView } from "@/components/refine-ui/views/edit-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { useBack, useList } from "@refinedev/core";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { subjectSchema } from "@/lib/schema";
import * as z from "zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Department } from "@/types";

const SubjectsEdit = () => {
    const back = useBack();

    const form = useForm({
        resolver: zodResolver(subjectSchema),
        refineCoreProps: {
            resource: "subjects",
            action: "edit",
        },
    });

    const {
        refineCore: { onFinish, query },
        handleSubmit,
        formState: { isSubmitting },
        control,
    } = form;

    const isLoading = query?.isLoading;

    const { query: departmentsQuery } = useList<Department>({
        resource: 'departments',
        pagination: { pageSize: 100 }
    });
    const departments = departmentsQuery?.data?.data || [];
    const departmentsLoading = departmentsQuery?.isLoading;

    const onSubmit = async (values: z.infer<typeof subjectSchema>) => {
        try {
            await onFinish(values);
        } catch (error) {
            console.error("Error editing subject:", error);
        }
    };

    return (
        <EditView className="class-view">
            <Breadcrumb />

            <h1 className="page-title">Edit Subject</h1>
            <div className="intro-row">
                <p>Update the information for this subject.</p>
                <Button onClick={() => back()}>Go Back</Button>
            </div>

            <Separator />

            <div className="my-4 flex items-center">
                <Card className="class-form-card">
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
                            Subject Details
                        </CardTitle>
                    </CardHeader>

                    <Separator />

                    <CardContent className="mt-7">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Subject Code <span className="text-orange-600">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="PHY101" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Subject Name <span className="text-orange-600">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Physics" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={control}
                                        name="departmentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Department <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(Number(value))}
                                                    value={field.value?.toString()}
                                                    disabled={departmentsLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a department" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {departments.map((department) => (
                                                            <SelectItem
                                                                key={department.id}
                                                                value={department.id.toString()}
                                                            >
                                                                {department.name} ({department.code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Brief description about the subject"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />

                                    <Button type="submit" size="lg" className="w-full">
                                        {isSubmitting ? (
                                            <div className="flex gap-1 items-center justify-center">
                                                <span>Saving Changes...</span>
                                                <Loader2 className="inline-block ml-2 animate-spin" />
                                            </div>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </EditView>
    );
};

export default SubjectsEdit;
