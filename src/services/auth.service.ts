import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authService = {
  register: async (data: {
    email: string;
    password: string;
    name?: string;
  }) => {
    // Email already exists কিনা check
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new Error("Email already exists");

    const hashedPassword = await bcrypt.hash(data.password, 12);

    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      // Password কখনো response এ পাঠাবো না
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  },

  getUserById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });
  },

  updateProfile: async (
    id: string,
    data: Partial<{
      name: string;
      image: string;
    }>,
  ) => {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    });
  },

  changePassword: async (
    id: string,
    currentPassword: string,
    newPassword: string,
  ) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.password) throw new Error("User not found");

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new Error("Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 12);
    return prisma.user.update({
      where: { id },
      data: { password: hashed },
      select: { id: true },
    });
  },
};
