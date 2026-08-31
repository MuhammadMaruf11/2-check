/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm, type Control, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button, message, Card, Typography } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import FormTextInput from "@/components/ui/FormTextInput";
import FormPasswordInput from "@/components/ui/FormPasswordInput";
import { registerSchema, RegisterTypes } from "@/schemas/auth.schema";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RegisterTypes>({
    resolver: zodResolver(registerSchema),
  });

  const rhfControl = control as unknown as Control<FieldValues>;

  const onSubmit = async (data: RegisterTypes) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...data, role: "USER" }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        message.success("Registration successful! Please login.");
        router.push("/login");
      } else {
        message.error("Registration failed. Email might already exist.");
      }
    } catch (error) {
      message.error("Something went wrong!");
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
            Create Account
          </Title>
          <Text type="secondary">Join us to get started</Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormTextInput
            name="name"
            control={rhfControl}
            label="Full Name"
            error={errors.name}
            prefix={<UserOutlined className="text-slate-400" />}
            placeholder="Enter your name"
          />

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
            placeholder="Create a password"
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
            Register
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Text>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary! font-bold hover:underline"
            >
              Login here
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
