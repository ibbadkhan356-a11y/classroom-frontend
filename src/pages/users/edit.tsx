import { EditView } from "@/components/refine-ui/views/edit-view.tsx";
import { useForm } from "@refinedev/react-hook-form";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader2 } from "lucide-react";
import UploadWidget from "@/components/upload-widgets.tsx";
import { User } from "@/types";

const UsersEdit = () => {
    const form = useForm<User>({
        defaultValues: {
            name: "",
            email: "",
            role: "student",
            image: "",
            imageCldPubId: "",
        }
    });

    const {
        refineCore: { onFinish, query },
        formState: { isSubmitting },
    } = form;

    const data = query?.data?.data;

    useEffect(() => {
        if (data) {
            form.reset({
                name: data.name,
                email: data.email,
                role: data.role,
                image: data.image,
                imageCldPubId: data.imageCldPubId,
            });
        }
    }, [data, form.reset]);

    return (
        <EditView>
            <Form {...form}>
                <form className="space-y-4 max-w-lg" onSubmit={form.handleSubmit((data) => onFinish(data))}>
                    <FormItem>
                        <FormLabel>Profile Picture</FormLabel>
                        <FormControl>
                            <UploadWidget
                                value={form.watch('image') ? { url: form.watch('image')!, publicId: form.watch('imageCldPubId')! } : null}
                                onChange={(val) => {
                                    form.setValue('image', val?.url || '');
                                    form.setValue('imageCldPubId', val?.publicId || '');
                                }}
                            />
                        </FormControl>
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="name"
                        rules={{ required: "Name is required" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        rules={{ 
                            required: "Email is required",
                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } 
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="role"
                        rules={{ required: "Role is required" }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="teacher">Teacher</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" size="lg" className="w-full mt-6">
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
        </EditView>
    );
};

export default UsersEdit;
