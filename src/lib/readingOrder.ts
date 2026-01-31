export const createReadingOrder = (
  length: number,
  random: () => number = Math.random,
): number[] => {
  const order = Array.from({ length }, (_, index) => index)

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const temp = order[i]
    order[i] = order[j]
    order[j] = temp
  }

  return order
}
