"use client";
import { Pagination } from "antd";

interface Props {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export const GlobalPagination = ({
  current,
  total,
  pageSize,
  onChange,
}: Props) => (
  <div className="flex justify-center mt-8">
    <Pagination
      current={current}
      total={total}
      pageSize={pageSize}
      onChange={onChange}
      showSizeChanger={false}
    />
  </div>
);
