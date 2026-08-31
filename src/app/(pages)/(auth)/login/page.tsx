"use client";

import { useForm, type Control, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, message, Card, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import FormTextInput from "@/components/ui/FormTextInput";
import FormPasswordInput from "@/components/ui/FormPasswordInput";
import { loginSchema, LoginTypes } from "@/schemas/auth.schema";
import Image from "next/image";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginTypes>({
    resolver: zodResolver(loginSchema),
  });

  const rhfControl = control as unknown as Control<FieldValues>;

  const onSubmit = async (data: LoginTypes) => {
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      message.error("Login failed! Check your credentials.");
    } else {
      message.success("Welcome back!");

      // Login success howar por session theke user er role fetch korar jonno
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const role = session?.user?.role;

        // Role onujayi redirect path fix kora
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "AUTHOR") {
          router.push("/author"); // Apnar author dashboard er path jodi alada hoy (e.g. /author) tahabe seta diben
        } else {
          router.push("/user");
        }
      } catch {
        // Fallback jodi kono karone session fetch fail kore
        router.push("/user");
      }

      router.refresh();
    }
  };

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-cover bg-center">
      <Image
        src="/images/bg-1.png"
        className="absolute inset-0 object-cover"
        alt="Background"
        fill
        priority
      />

      <Card
        className="w-full max-w-md shadow-2xl z-10 p-4 border-none bg-white"
        style={{ borderRadius: "12px" }}
      >
        <div className="mb-8 text-center">
          <Title level={2} className="text-primary mb-1!">
            Welcome Back
          </Title>
          <Text type="secondary">Please login to your account</Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormTextInput
            name="email"
            control={rhfControl}
            label="Email Address"
            error={errors.email}
            prefix={<MailOutlined className="text-slate-400" />}
            placeholder="Enter your email"
          />

          <FormPasswordInput
            name="password"
            control={rhfControl}
            label="Password"
            error={errors.password}
            prefix={<LockOutlined className="text-slate-400" />}
            placeholder="Enter your password"
          />

          <Button
            variant="solid"
            color="primary"
            size="large"
            htmlType="submit"
            loading={isSubmitting}
            block
            className="bg-primary! hover:bg-primary/90 text-lg font-semibold"
          >
            Login
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <div>
            Forgot password?{" "}
            <Link href="/forgot-password" className="text-primary!">
              Reset Here
            </Link>
          </div>
          <div className="">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary! font-bold hover:underline"
            >
              Register
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
