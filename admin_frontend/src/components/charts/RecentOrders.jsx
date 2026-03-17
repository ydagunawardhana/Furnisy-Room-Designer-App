import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

export default function RecentOrders({ orders = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50">
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs"
              >
                Product Details
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs"
              >
                Customer Name
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs"
              >
                Total Price
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="4"
                  className="py-8 text-center text-gray-500"
                >
                  No recent orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const firstItem =
                  order.items?.[0] || order.cartItems?.[0] || {};
                const itemName =
                  firstItem.name || `Order #${order.id.substring(0, 6)}`;
                const itemImage =
                  firstItem.image ||
                  firstItem.img ||
                  "/images/product/product-01.jpg";
                const itemCount =
                  order.items?.length || order.cartItems?.length || 1;

                const totalPrice =
                  order.totalAmount ||
                  order.totalPrice ||
                  order.total ||
                  "$0.00";
                const status = order.status || "Pending";

                return (
                  <TableRow key={order.id}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-50 flex items-center justify-center">
                          <img
                            src={itemImage}
                            className="max-h-[50px] object-contain mix-blend-multiply"
                            alt={itemName}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm">
                            {itemName}
                          </p>
                          <span className="text-gray-500 text-theme-xs">
                            {itemCount} {itemCount > 1 ? "Items" : "Item"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm">
                      {order.customerName || "Guest User"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-800 font-semibold text-theme-sm">
                      {typeof totalPrice === "number"
                        ? `$${totalPrice.toFixed(2)}`
                        : totalPrice}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm">
                      <Badge
                        size="sm"
                        color={
                          status.toLowerCase() === "delivered" ||
                          status.toLowerCase() === "completed"
                            ? "success"
                            : status.toLowerCase() === "pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
