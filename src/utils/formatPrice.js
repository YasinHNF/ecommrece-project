const formatter = Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export function formatPriceCents(priceCents) {
    if (!priceCents) return;

    const priceDollars = priceCents / 100;
    return formatter.format(priceDollars)
}