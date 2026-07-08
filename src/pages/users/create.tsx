import { CreateView } from "@/components/refine-ui/views/create-view.tsx";
import { useForm } from "@refinedev/react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import UploadWidget from "@/components/upload-widgets.tsx";
import { User } from "@/types";

const UsersCreate = () => {
    const {
        refineCore: { onFinish },
        ...form
    } = useForm<User>();

    return (
        <CreateView>
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
                        defaultValue="student"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    {/* We let backend generate a default password, but admin can optionally set one */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Leave blank for default (Welcome123!)" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </CreateView>
    );
};

export default UsersCreate;
