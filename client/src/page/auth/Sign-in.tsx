import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import GoogleOauthButton from "@/components/auth/google-oauth-button";
import { useMutation } from "@tanstack/react-query";
import { loginMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const formSchema = z.object({
    email: z.string().trim().email("Неверный адрес почты").min(1, {
      message: "Укажите название для рабочей области",
    }),
    password: z.string().trim().min(1, {
      message: "Укажите пароль",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    mutate(values, {
      onSuccess: (data) => {
        const user = data.user;
        console.log(user);
        const decodedUrl = returnUrl ? decodeURIComponent(returnUrl) : null;
        navigate(decodedUrl || `/workspace/${user.currentWorkspace}`);
      },
      onError: (error) => {
        toast({
          title: "Уведомление",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          T-Sync.
        </Link>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Вход</CardTitle>
              <CardDescription>
                Войдите в систему при помощи электронной почты или Google
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-6">
                    <div className="flex flex-col gap-4">
                      <GoogleOauthButton label="Login" />
                    </div>
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                      <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        или
                      </span>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                Почта
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder=""
                                  className="!h-[48px]"
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center">
                                <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                                  Пароль
                                </FormLabel>
                                {/* <a
                                  href="#"
                                  className="ml-auto text-sm underline-offset-4 hover:underline"
                                >
                                  Забыли пароль?
                                </a> */}
                              </div>
                              <FormControl>
                                <Input
                                  type="password"
                                  className="!h-[48px]"
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                      >
                        {isPending && <Loader className="animate-spin" />}
                        Войти
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      Нет учетной записи?{" "}
                      <Link
                        to="/sign-up"
                        className="underline underline-offset-4"
                      >
                        Создать аккаунт
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
