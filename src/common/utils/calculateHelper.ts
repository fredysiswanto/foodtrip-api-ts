export function calculateCartTotals(items: { price: number | string; quantity: number }[]) {
	const subtotal = items.reduce((acc, item) => {
		return acc + Number(item.price) * item.quantity;
	}, 0);

	return {
		subtotal,
		totalItems: items.length,
	};
}
