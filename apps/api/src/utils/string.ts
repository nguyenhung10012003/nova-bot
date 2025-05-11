export function camelToSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // thêm dấu gạch dưới trước chữ cái viết hoa
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2') // xử lý các chữ cái viết hoa liên tiếp
    .toLowerCase(); // chuyển toàn bộ về chữ thường
}
