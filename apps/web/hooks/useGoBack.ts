"use client";
import { useRouter, usePathname } from "next/navigation";

export const useGoBack = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (depth: number = 1) => {
    if (depth < 1) return; // Không làm gì nếu depth < 1

    const pathSegments = pathname.split("/").filter(Boolean); // Tách đường dẫn thành mảng
    if (pathSegments.length === 0) return; // Nếu đang ở "/", không làm gì cả

    const newPath = "/" + pathSegments.slice(0, -depth).join("/"); // Cắt bỏ depth cấp
    router.push(newPath || "/"); // Nếu kết quả rỗng, quay về "/"
  };
};

export default useGoBack;
